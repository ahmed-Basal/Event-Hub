using DevMeet.Shared.Events;

namespace Identity.Module.Domain;

public sealed record UserProfileUpdatedEvent(string UserId, string DisplayName) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record UserMainPhotoChangedEvent(string UserId, string PhotoUrl) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record UserRolesUpdatedEvent(string UserId, IReadOnlyCollection<string> Roles) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
