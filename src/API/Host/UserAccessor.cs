using System.Security.Claims;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, IAppDbContext appDbContext) : IUserAccessor
{
    public string? GetEmail()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("email");
    }

    public string? GetUsername()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("preferred_username")
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("name");
    }

    public string? GetUserIdOrNull()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
    }

    public string GetUserId()
    {
        return GetUserIdOrNull()
            ?? throw new UnauthorizedAccessException("User is not authenticated");
    }

    public async Task<User> GetUserAsync()
    {
        var userId = GetUserId();
        var email = GetEmail();
        var username = GetUsername();

        var user = await appDbContext.Users.FirstOrDefaultAsync(u =>
            u.Id == userId || (email != null && u.Email == email) || (username != null && u.UserName == username));

        if (user == null && !string.IsNullOrEmpty(userId))
        {
            var resolvedUserName = username ?? email ?? userId;
            var resolvedEmail = email ?? $"{resolvedUserName}@keycloak.local";
            user = User.Create(
                userName: resolvedUserName,
                email: resolvedEmail,
                displayName: username ?? email ?? "User",
                emailConfirmed: true,
                id: userId);
            appDbContext.Users.Add(user);
            await appDbContext.SaveChangesAsync();
        }

        return user ?? throw new UnauthorizedAccessException("User not found in database");
    }

    public string? GetIpAddress()
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
        {
            return forwarded.ToString().Split(',')[0].Trim();
        }
        return httpContext.Connection.RemoteIpAddress?.ToString();
    }

    public string? GetRefreshToken()
    {
        return httpContextAccessor.HttpContext?.Request.Cookies["refreshToken"];
    }
}
