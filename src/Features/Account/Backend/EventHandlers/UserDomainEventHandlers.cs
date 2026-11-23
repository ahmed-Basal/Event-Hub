using Application.Common.Events;
using Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Account.EventHandlers;

public sealed class UserDomainEventHandlers(
    ILogger<UserDomainEventHandlers> logger)
    : INotificationHandler<DomainEventNotification<UserProfileUpdatedEvent>>,
      INotificationHandler<DomainEventNotification<UserMainPhotoChangedEvent>>,
      INotificationHandler<DomainEventNotification<RefreshTokenRevokedEvent>>
{
    public Task Handle(
        DomainEventNotification<UserProfileUpdatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: User {UserId} updated profile (DisplayName={DisplayName})",
            e.EventId, e.UserId, e.DisplayName);
        return Task.CompletedTask;
    }

    public Task Handle(
        DomainEventNotification<UserMainPhotoChangedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: User {UserId} changed main photo to {PhotoId}",
            e.EventId, e.UserId, e.PhotoId);
        return Task.CompletedTask;
    }

    public Task Handle(
        DomainEventNotification<RefreshTokenRevokedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: RefreshToken {TokenId} for User {UserId} revoked (IP={Ip})",
            e.EventId, e.TokenId, e.UserId, e.RevokedByIp ?? "unknown");
        return Task.CompletedTask;
    }
}
