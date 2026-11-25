namespace Identity.Contracts;

public sealed record UserSummary(
    string Id,
    string UserName,
    string DisplayName,
    string? Bio,
    string? Picture,
    string? Email);

public interface ICurrentUser
{
    string UserId { get; }
    string? UserIdOrNull { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}

public interface IIdentityDirectory
{
    Task<UserSummary?> GetByIdAsync(string userId, CancellationToken ct = default);
    Task<UserSummary?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, UserSummary>> GetByIdsAsync(IEnumerable<string> userIds, CancellationToken ct = default);
    Task UpdateProfileAsync(string userId, string displayName, string? bio, CancellationToken ct = default);
    Task UpdatePictureAsync(string userId, string? pictureUrl, CancellationToken ct = default);
    Task<int> CountUsersAsync(CancellationToken ct = default);
}

public interface IEmailDispatcher
{
    void EnqueueEmail(string toEmail, string subject, string htmlBody);
}
