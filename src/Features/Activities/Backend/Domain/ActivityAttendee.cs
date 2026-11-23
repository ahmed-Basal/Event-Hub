using Domain.Common;

namespace Domain;

public sealed class ActivityAttendee : BaseEntity
{
    private ActivityAttendee() { }

    public string? UserId { get; private set; }
    public string? ActivityId { get; private set; }

    public User User { get; private set; } = null!;
    public Activity Activity { get; private set; } = null!;
    public bool IsHost { get; private set; }
    public DateTimeOffset DateJoined { get; private set; } = DateTimeOffset.UtcNow;

    public static ActivityAttendee Create(
        string userId,
        string activityId,
        bool isHost = false,
        DateTimeOffset? dateJoined = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        ArgumentException.ThrowIfNullOrWhiteSpace(activityId, nameof(activityId));

        return new ActivityAttendee
        {
            UserId = userId.Trim(),
            ActivityId = activityId.Trim(),
            IsHost = isHost,
            DateJoined = dateJoined?.ToUniversalTime() ?? DateTimeOffset.UtcNow
        };
    }

    public void PromoteToHost() => IsHost = true;

    public void DemoteFromHost() => IsHost = false;
}
