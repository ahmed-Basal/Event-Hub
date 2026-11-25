namespace Profiles.Contracts;

public sealed record FollowStats(
    int FollowersCount,
    int FollowingCount,
    bool IsFollowing);

public interface IProfilesDirectory
{
    Task<FollowStats> GetFollowStatsAsync(string targetUserId, string? currentUserId, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, FollowStats>> GetFollowStatsBatchAsync(
        IEnumerable<string> targetUserIds,
        string? currentUserId,
        CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetFollowingUserIdsAsync(string observerId, CancellationToken ct = default);
}
