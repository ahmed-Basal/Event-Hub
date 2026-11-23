using Domain.Common;

namespace Domain.Events;

public sealed record ActivityCreatedEvent(
    string ActivityId,
    string Title) : DomainEvent;

public sealed record ActivityDetailsUpdatedEvent(
    string ActivityId,
    string Title) : DomainEvent;

public sealed record ActivityCancelledEvent(
    string ActivityId,
    string Title,
    string? ActorUserId) : DomainEvent;

public sealed record ActivityReactivatedEvent(
    string ActivityId,
    string Title,
    string? ActorUserId) : DomainEvent;

public sealed record ActivityAttendeeJoinedEvent(
    string ActivityId,
    string Title,
    string UserId,
    bool IsHost) : DomainEvent;

public sealed record ActivityAttendeeLeftEvent(
    string ActivityId,
    string Title,
    string UserId) : DomainEvent;
