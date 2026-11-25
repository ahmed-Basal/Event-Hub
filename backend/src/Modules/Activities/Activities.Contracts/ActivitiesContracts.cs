namespace Activities.Contracts;

public sealed record ActivitySummary(
    string Id,
    string Title,
    string Slug,
    string Category,
    DateTimeOffset Date,
    string City,
    string Venue,
    decimal Price,
    string Currency,
    bool IsCancelled,
    string? HostId);

public sealed record UserActivityItem(
    string Id,
    string Title,
    string Category,
    DateTimeOffset Date);

public interface IActivitiesDirectory
{
    Task<ActivitySummary?> GetByIdAsync(string activityId, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, ActivitySummary>> GetByIdsAsync(IEnumerable<string> activityIds, CancellationToken ct = default);
    Task<IReadOnlyList<UserActivityItem>> GetUserActivitiesAsync(string userId, string filter, CancellationToken ct = default);
    Task<bool> IsHostAsync(string activityId, string userId, CancellationToken ct = default);
    Task EnsureAttendeeAsync(string activityId, string userId, CancellationToken ct = default);
}
