namespace Activities.Module.Domain;

public sealed class ActivityWaitlistEntry
{
    private ActivityWaitlistEntry() { }

    public string ActivityId { get; private set; } = string.Empty;
    public string UserId { get; private set; } = string.Empty;
    public Activity Activity { get; private set; } = null!;
    public DateTimeOffset JoinedAtUtc { get; private set; } = DateTimeOffset.UtcNow;

    public static ActivityWaitlistEntry Create(string userId, string activityId, DateTimeOffset? joinedAtUtc = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        ArgumentException.ThrowIfNullOrWhiteSpace(activityId, nameof(activityId));

        return new ActivityWaitlistEntry
        {
            UserId = userId.Trim(),
            ActivityId = activityId.Trim(),
            JoinedAtUtc = joinedAtUtc?.ToUniversalTime() ?? DateTimeOffset.UtcNow
        };
    }
}
