using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using DevMeet.Shared.Jobs;
using Identity.Contracts;
using Identity.Module.Jobs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Identity.Module.Infrastructure;

public sealed class KeycloakOptions
{
    public const string SectionName = "Keycloak";
    public string Authority { get; set; } = "http://localhost:8082/realms/reactivities";
    public string Audience { get; set; } = "reactivities-api";
    public bool RequireHttpsMetadata { get; set; } = false;
    public string? ValidIssuer { get; set; }
}

public sealed class ResendSettings
{
    public const string SectionName = "Resend";
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "onboarding@resend.dev";
}

public sealed record UserResponseDto(
    string Id,
    string DisplayName,
    string Username,
    string? Image,
    List<string> Roles);

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

public sealed class EmailService(
    IOptions<ResendSettings> options,
    IHttpClientFactory httpClientFactory,
    ILogger<EmailService> logger) : IEmailService
{
    private readonly ResendSettings _settings = options.Value;

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
            return;

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            logger.LogDebug("[DEV EMAIL] To: {To} | Subject: {Subject} (Resend API key not configured; delivery skipped)", toEmail, subject);
            return;
        }

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        var response = await client.PostAsJsonAsync(
            "https://api.resend.com/emails",
            new { from = _settings.FromEmail, to = new[] { toEmail }, subject, html = htmlBody },
            ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Resend email delivery failed ({Status}): {Body}", response.StatusCode, body);
            throw new InvalidOperationException($"Resend email delivery failed with status {response.StatusCode}.");
        }
    }
}

public sealed class HangfireEmailDispatcher(IBackgroundJobScheduler backgroundJobs) : IEmailDispatcher
{
    public void EnqueueEmail(string toEmail, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
            return;

        backgroundJobs.Enqueue<SendEmailJob>(job => job.SendAsync(toEmail, subject, htmlBody, CancellationToken.None));
    }
}

public sealed class CurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public string? UserIdOrNull =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub");

    public string UserId => UserIdOrNull
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    public string? Email =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email)
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("email");

    public string? Username =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("preferred_username")
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("name");

    public string? DisplayName =>
        httpContextAccessor.HttpContext?.User.FindFirstValue("name")
        ?? Username;

    public IReadOnlyList<string> Roles =>
        httpContextAccessor.HttpContext?.User.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? [];

    public bool IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}

public sealed class IdentityDirectory(IdentityDbContext db) : IIdentityDirectory
{
    public async Task<UserSummary?> GetByIdAsync(string userId, CancellationToken ct = default)
    {
        return await db.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserSummary(u.Id, u.UserName, u.DisplayName, u.Bio, u.Picture, u.Email))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<UserSummary?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        var normalized = username.Trim().ToLower();
        return await db.Users.AsNoTracking()
            .Where(u => u.UserName.ToLower() == normalized)
            .Select(u => new UserSummary(u.Id, u.UserName, u.DisplayName, u.Bio, u.Picture, u.Email))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyDictionary<string, UserSummary>> GetByIdsAsync(IEnumerable<string> userIds, CancellationToken ct = default)
    {
        var ids = userIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<string, UserSummary>();

        var users = await db.Users.AsNoTracking()
            .Where(u => ids.Contains(u.Id))
            .Select(u => new UserSummary(u.Id, u.UserName, u.DisplayName, u.Bio, u.Picture, u.Email))
            .ToListAsync(ct);

        return users.ToDictionary(u => u.Id);
    }

    public async Task UpdateProfileAsync(string userId, string displayName, string? bio, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new KeyNotFoundException("User not found.");
        user.UpdateProfile(displayName, bio);
        await db.SaveChangesAsync(ct);
    }

    public async Task UpdatePictureAsync(string userId, string? pictureUrl, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new KeyNotFoundException("User not found.");
        user.UpdatePicture(pictureUrl);
        await db.SaveChangesAsync(ct);
    }

    public Task<int> CountUsersAsync(CancellationToken ct = default)
        => db.Users.CountAsync(ct);
}

public sealed class KeycloakClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            return Task.FromResult(principal);

        if (!identity.HasClaim(c => c.Type == ClaimTypes.NameIdentifier))
        {
            var sub = identity.FindFirst("sub")?.Value;
            if (!string.IsNullOrWhiteSpace(sub))
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, sub));
        }

        if (!identity.HasClaim(c => c.Type == ClaimTypes.Name))
        {
            var username = identity.FindFirst("preferred_username")?.Value;
            if (!string.IsNullOrWhiteSpace(username))
                identity.AddClaim(new Claim(ClaimTypes.Name, username));
        }

        if (!identity.HasClaim(c => c.Type == ClaimTypes.Email))
        {
            var email = identity.FindFirst("email")?.Value;
            if (!string.IsNullOrWhiteSpace(email))
                identity.AddClaim(new Claim(ClaimTypes.Email, email));
        }

        var existingRoles = identity.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var roleValue in identity.FindAll("roles").Select(c => c.Value).ToList())
        {
            if (!string.IsNullOrWhiteSpace(roleValue) && existingRoles.Add(roleValue))
                identity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
        }

        var realmAccessJson = identity.FindFirst("realm_access")?.Value;
        if (!string.IsNullOrWhiteSpace(realmAccessJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(realmAccessJson);
                if (doc.RootElement.TryGetProperty("roles", out var rolesElement) && rolesElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        var roleName = role.GetString();
                        if (!string.IsNullOrWhiteSpace(roleName) && existingRoles.Add(roleName))
                            identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
                    }
                }
            }
            catch (JsonException) { }
        }

        return Task.FromResult(principal);
    }
}
