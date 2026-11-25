using System.Security.Claims;
using Activities.Contracts;
using Activities.Module.Domain;
using Identity.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Profiles.Contracts;

namespace Activities.Module.Infrastructure;

public sealed record AttendeeDto(
    string Username,
    string DisplayName,
    string? Bio,
    string? Image,
    bool IsHost,
    bool Following,
    int FollowersCount,
    int FollowingCount);

public sealed record ActivityDto(
    string ID,
    string Title,
    string Slug,
    DateTimeOffset Date,
    string Description,
    string Category,
    bool IsCancelled,
    string City,
    string Venue,
    double Latitude,
    double Longitude,
    string Image,
    string Level,
    decimal Price,
    string Currency,
    int HotScore,
    int? MaxCapacity,
    int WaitlistCount,
    bool IsWaitlisted,
    List<string> Tags,
    string? HostUsername,
    string? HostDisplayName,
    List<AttendeeDto> Attendees);

public sealed class IsHostRequirement : IAuthorizationRequirement
{
    public const string PolicyName = "IsActivityHost";
}

public sealed class IsHostRequirementHandler(
    ActivitiesDbContext db,
    IHttpContextAccessor httpContextAccessor)
    : AuthorizationHandler<IsHostRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        IsHostRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId)) return;

        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext?.GetRouteValue("id") is not string activityId) return;

        var isHost = await db.ActivityAttendees
            .AsNoTracking()
            .AnyAsync(a =>
                (a.ActivityId == activityId || a.Activity.Slug == activityId) &&
                a.UserId == userId &&
                a.IsHost);

        if (isHost) context.Succeed(requirement);
    }
}

public sealed class ActivitiesDirectory(ActivitiesDbContext db) : IActivitiesDirectory
{
    public async Task<ActivitySummary?> GetByIdAsync(string activityId, CancellationToken ct = default)
    {
        var a = await db.Activities.AsNoTracking()
            .Include(x => x.Attendees)
            .FirstOrDefaultAsync(x => x.Id == activityId || x.Slug == activityId, ct);

        if (a is null) return null;

        var hostId = a.Attendees.FirstOrDefault(x => x.IsHost)?.UserId;
        return new ActivitySummary(a.Id, a.Title, a.Slug, a.Category, a.Date, a.City, a.Venue, a.Price, a.Currency, a.IsCancelled, hostId);
    }

    public async Task<IReadOnlyDictionary<string, ActivitySummary>> GetByIdsAsync(
        IEnumerable<string> activityIds,
        CancellationToken ct = default)
    {
        var ids = activityIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<string, ActivitySummary>();

        var activities = await db.Activities.AsNoTracking()
            .Include(x => x.Attendees)
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(ct);

        return activities.ToDictionary(
            a => a.Id,
            a =>
            {
                var hostId = a.Attendees.FirstOrDefault(x => x.IsHost)?.UserId;
                return new ActivitySummary(a.Id, a.Title, a.Slug, a.Category, a.Date, a.City, a.Venue, a.Price, a.Currency, a.IsCancelled, hostId);
            });
    }

    public async Task<IReadOnlyList<UserActivityItem>> GetUserActivitiesAsync(string userId, string filter, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var query = db.ActivityAttendees.AsNoTracking()
            .Where(aa => aa.UserId == userId);

        query = filter.ToLowerInvariant() switch
        {
            "past" => query.Where(aa => aa.Activity.Date < now),
            "hosting" => query.Where(aa => aa.IsHost),
            _ => query.Where(aa => aa.Activity.Date >= now)
        };

        return await query
            .OrderBy(aa => aa.Activity.Date)
            .Select(aa => new UserActivityItem(aa.Activity.Id, aa.Activity.Title, aa.Activity.Category, aa.Activity.Date))
            .ToListAsync(ct);
    }

    public Task<bool> IsHostAsync(string activityId, string userId, CancellationToken ct = default)
        => db.ActivityAttendees.AsNoTracking()
            .AnyAsync(a => (a.ActivityId == activityId || a.Activity.Slug == activityId) && a.UserId == userId && a.IsHost, ct);

    public async Task EnsureAttendeeAsync(string activityId, string userId, CancellationToken ct = default)
    {
        var activity = await db.Activities
            .Include(a => a.Attendees)
            .Include(a => a.Waitlist)
            .FirstOrDefaultAsync(a => a.Id == activityId, ct);
        if (activity is null) return;

        activity.LeaveWaitlist(userId);
        if (activity.Attendees.All(a => a.UserId != userId))
        {
            activity.AddAttendee(userId, isHost: false);
        }
        await db.SaveChangesAsync(ct);
    }
}

public static class ActivityMapper
{
    public static async Task<List<ActivityDto>> MapToDtosAsync(
        IReadOnlyList<Activity> activities,
        IIdentityDirectory identity,
        IProfilesDirectory profiles,
        string? currentUserId,
        CancellationToken ct)
    {
        if (activities.Count == 0) return [];

        var allUserIds = activities
            .SelectMany(a => a.Attendees.Select(att => att.UserId))
            .Distinct()
            .ToList();

        var users = await identity.GetByIdsAsync(allUserIds, ct);
        var stats = await profiles.GetFollowStatsBatchAsync(allUserIds, currentUserId, ct);

        return activities.Select(a =>
        {
            var attendees = a.Attendees.Select(att =>
            {
                users.TryGetValue(att.UserId, out var u);
                stats.TryGetValue(att.UserId, out var s);
                return new AttendeeDto(
                    u?.UserName ?? string.Empty,
                    u?.DisplayName ?? "User",
                    u?.Bio,
                    u?.Picture,
                    att.IsHost,
                    s?.IsFollowing ?? false,
                    s?.FollowersCount ?? 0,
                    s?.FollowingCount ?? 0);
            }).ToList();

            var host = attendees.FirstOrDefault(x => x.IsHost);
            var isWaitlisted = !string.IsNullOrWhiteSpace(currentUserId) && a.Waitlist.Any(w => w.UserId == currentUserId);

            return new ActivityDto(
                a.Id,
                a.Title,
                a.Slug,
                a.Date,
                a.Description,
                a.Category,
                a.IsCancelled,
                a.City,
                a.Venue,
                a.Latitude,
                a.Longitude,
                a.Image,
                a.Level,
                a.Price,
                a.Currency,
                attendees.Count,
                a.MaxCapacity,
                a.Waitlist.Count,
                isWaitlisted,
                a.Tags.ToList(),
                host?.Username,
                host?.DisplayName,
                attendees);
        }).ToList();
    }
}
