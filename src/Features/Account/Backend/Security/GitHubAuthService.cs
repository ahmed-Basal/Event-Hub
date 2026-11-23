using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Security;

public class GitHubAuthService(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory) : IGitHubAuthService
{
    public async Task<GitHubUserInfo?> ExchangeCodeAsync(string code, CancellationToken ct = default)
    {
        var clientId = configuration["Authentication:GitHub:ClientId"];
        var clientSecret = configuration["Authentication:GitHub:ClientSecret"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            return null;
        }

        var http = httpClientFactory.CreateClient();
        http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        http.DefaultRequestHeaders.UserAgent.ParseAdd("DevMeetApp");

        var tokenResp = await http.PostAsJsonAsync(
            "https://github.com/login/oauth/access_token",
            new { client_id = clientId, client_secret = clientSecret, code },
            ct);

        if (!tokenResp.IsSuccessStatusCode) return null;

        var tokenPayload = await tokenResp.Content.ReadFromJsonAsync<GitHubTokenResponse>(ct);
        if (string.IsNullOrWhiteSpace(tokenPayload?.AccessToken)) return null;

        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenPayload.AccessToken);

        var ghUser = await http.GetFromJsonAsync<GitHubUserResponse>("https://api.github.com/user", ct);
        if (ghUser is null || string.IsNullOrWhiteSpace(ghUser.Login)) return null;

        var email = ghUser.Email;
        if (string.IsNullOrWhiteSpace(email))
        {
            var emails = await http.GetFromJsonAsync<List<GitHubEmailResponse>>(
                "https://api.github.com/user/emails", ct);
            email = emails?.FirstOrDefault(e => e.Primary && e.Verified)?.Email
                ?? emails?.FirstOrDefault()?.Email
                ?? $"{ghUser.Login}@users.noreply.github.com";
        }

        return new GitHubUserInfo(ghUser.Login, ghUser.Name, email, ghUser.AvatarUrl);
    }

    private sealed record GitHubTokenResponse([property: JsonPropertyName("access_token")] string? AccessToken);
    private sealed record GitHubUserResponse(
        [property: JsonPropertyName("login")] string? Login,
        [property: JsonPropertyName("name")] string? Name,
        [property: JsonPropertyName("email")] string? Email,
        [property: JsonPropertyName("avatar_url")] string? AvatarUrl);
    private sealed record GitHubEmailResponse(
        [property: JsonPropertyName("email")] string Email,
        [property: JsonPropertyName("primary")] bool Primary,
        [property: JsonPropertyName("verified")] bool Verified);
}
