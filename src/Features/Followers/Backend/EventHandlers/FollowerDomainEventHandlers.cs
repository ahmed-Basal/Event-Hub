using Application.Common.Events;
using Application.Interfaces;
using Domain;
using Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Followers.EventHandlers;

public sealed class UserFollowedEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<UserFollowedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<UserFollowedEvent>>
{
    public async Task Handle(
        DomainEventNotification<UserFollowedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        try
        {
            var observer = await dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == e.ObserverId)
                .Select(u => new { u.UserName, u.DisplayName })
                .FirstOrDefaultAsync(cancellationToken);

            if (observer is null) return;

            var observerName = observer.DisplayName ?? observer.UserName ?? "Someone";
            var profileSegment = observer.UserName ?? e.ObserverId;

            await notificationService.NotifyAsync(
                new NotificationRequest(
                    e.TargetId,
                    e.ObserverId,
                    NotificationType.NewFollower,
                    $"{observerName} started following you.",
                    $"/profiles/{profileSegment}"),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle UserFollowedEvent ({ObserverId} -> {TargetId})",
                e.ObserverId, e.TargetId);
        }
    }
}

public sealed class UserUnfollowedEventHandler(
    ILogger<UserUnfollowedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<UserUnfollowedEvent>>
{
    public Task Handle(
        DomainEventNotification<UserUnfollowedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: User {ObserverId} unfollowed {TargetId}",
            e.EventId, e.ObserverId, e.TargetId);
        return Task.CompletedTask;
    }
}
