using Domain.Common;

namespace Domain.Events;

public sealed record UserFollowedEvent(
    string ObserverId,
    string TargetId) : DomainEvent;

public sealed record UserUnfollowedEvent(
    string ObserverId,
    string TargetId) : DomainEvent;

public sealed record UserProfileUpdatedEvent(
    string UserId,
    string? DisplayName) : DomainEvent;

public sealed record UserMainPhotoChangedEvent(
    string UserId,
    string PhotoId,
    string PhotoUrl) : DomainEvent;

public sealed record RefreshTokenRevokedEvent(
    Guid TokenId,
    string UserId,
    string? RevokedByIp) : DomainEvent;
