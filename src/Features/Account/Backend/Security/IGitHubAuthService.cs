namespace Application.Interfaces;

public record GitHubUserInfo(string Login, string? Name, string Email, string? AvatarUrl);

public interface IGitHubAuthService
{
    Task<GitHubUserInfo?> ExchangeCodeAsync(string code, CancellationToken ct = default);
}
