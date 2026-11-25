using DevMeet.Shared.Events;

namespace Profiles.Module.Domain;

public sealed record UserFollowedEvent(string ObserverId, string TargetId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record UserUnfollowedEvent(string ObserverId, string TargetId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
