using DevMeet.Shared.Events;

namespace Activities.Module.Domain;

public sealed record ActivityCreatedEvent(string ActivityId, string Title) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record ActivityDetailsUpdatedEvent(string ActivityId, string Title, string? ActorUserId = null) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record ActivityCancelledEvent(string ActivityId, string Title, string? ActorUserId = null) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record ActivityReactivatedEvent(string ActivityId, string Title, string? ActorUserId = null) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record ActivityAttendeeJoinedEvent(string ActivityId, string Title, string UserId, bool IsHost) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record ActivityAttendeeLeftEvent(string ActivityId, string Title, string UserId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record WaitlistUserPromotedEvent(string ActivityId, string Title, string UserId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
