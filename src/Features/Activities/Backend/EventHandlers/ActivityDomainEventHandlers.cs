using Application.Common.Events;
using Application.Interfaces;
using Domain;
using Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Activities.EventHandlers;

public sealed class ActivityCancelledEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<ActivityCancelledEventHandler> logger)
    : INotificationHandler<DomainEventNotification<ActivityCancelledEvent>>
{
    public async Task Handle(
        DomainEventNotification<ActivityCancelledEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        try
        {
            var recipientIds = await dbContext.ActivityAttendees
                .AsNoTracking()
                .Where(a => a.ActivityId == e.ActivityId && a.UserId != null && a.UserId != e.ActorUserId)
                .Select(a => a.UserId!)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (recipientIds.Count == 0) return;

            var actorName = await ResolveUserDisplayNameAsync(dbContext, e.ActorUserId, cancellationToken);
            var msg = actorName is not null
                ? $"{actorName} cancelled \"{e.Title}\"."
                : $"\"{e.Title}\" has been cancelled.";
            var targetUrl = $"/activities/{e.ActivityId}";

            await notificationService.NotifyManyAsync(
                recipientIds.Select(rid => new NotificationRequest(
                    rid, e.ActorUserId, NotificationType.ActivityCancelled, msg, targetUrl)),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle ActivityCancelledEvent for Activity {ActivityId}", e.ActivityId);
        }
    }

    internal static async Task<string?> ResolveUserDisplayNameAsync(
        IAppDbContext dbContext,
        string? userId,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId)) return null;

        return await dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.DisplayName ?? u.UserName)
            .FirstOrDefaultAsync(ct);
    }
}

public sealed class ActivityReactivatedEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<ActivityReactivatedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<ActivityReactivatedEvent>>
{
    public async Task Handle(
        DomainEventNotification<ActivityReactivatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        try
        {
            var recipientIds = await dbContext.ActivityAttendees
                .AsNoTracking()
                .Where(a => a.ActivityId == e.ActivityId && a.UserId != null && a.UserId != e.ActorUserId)
                .Select(a => a.UserId!)
                .Distinct()
                .ToListAsync(cancellationToken);

            if (recipientIds.Count == 0) return;

            var actorName = await ActivityCancelledEventHandler.ResolveUserDisplayNameAsync(
                dbContext, e.ActorUserId, cancellationToken);
            var msg = actorName is not null
                ? $"{actorName} reactivated \"{e.Title}\"."
                : $"\"{e.Title}\" has been reactivated.";
            var targetUrl = $"/activities/{e.ActivityId}";

            await notificationService.NotifyManyAsync(
                recipientIds.Select(rid => new NotificationRequest(
                    rid, e.ActorUserId, NotificationType.ActivityReactivated, msg, targetUrl)),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle ActivityReactivatedEvent for Activity {ActivityId}", e.ActivityId);
        }
    }
}

public sealed class ActivityAttendeeJoinedEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<ActivityAttendeeJoinedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<ActivityAttendeeJoinedEvent>>
{
    public async Task Handle(
        DomainEventNotification<ActivityAttendeeJoinedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        if (e.IsHost) return;

        try
        {
            var hostUserId = await dbContext.ActivityAttendees
                .AsNoTracking()
                .Where(a => a.ActivityId == e.ActivityId && a.IsHost && a.UserId != null)
                .Select(a => a.UserId!)
                .FirstOrDefaultAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(hostUserId) || hostUserId == e.UserId) return;

            var actorName = await ActivityCancelledEventHandler.ResolveUserDisplayNameAsync(
                dbContext, e.UserId, cancellationToken) ?? "Someone";

            await notificationService.NotifyAsync(
                new NotificationRequest(
                    hostUserId,
                    e.UserId,
                    NotificationType.ActivityJoined,
                    $"{actorName} joined \"{e.Title}\".",
                    $"/activities/{e.ActivityId}"),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle ActivityAttendeeJoinedEvent for Activity {ActivityId}", e.ActivityId);
        }
    }
}

public sealed class ActivityAttendeeLeftEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<ActivityAttendeeLeftEventHandler> logger)
    : INotificationHandler<DomainEventNotification<ActivityAttendeeLeftEvent>>
{
    public async Task Handle(
        DomainEventNotification<ActivityAttendeeLeftEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        try
        {
            var hostUserId = await dbContext.ActivityAttendees
                .AsNoTracking()
                .Where(a => a.ActivityId == e.ActivityId && a.IsHost && a.UserId != null)
                .Select(a => a.UserId!)
                .FirstOrDefaultAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(hostUserId) || hostUserId == e.UserId) return;

            var actorName = await ActivityCancelledEventHandler.ResolveUserDisplayNameAsync(
                dbContext, e.UserId, cancellationToken) ?? "Someone";

            await notificationService.NotifyAsync(
                new NotificationRequest(
                    hostUserId,
                    e.UserId,
                    NotificationType.ActivityLeft,
                    $"{actorName} left \"{e.Title}\".",
                    $"/activities/{e.ActivityId}"),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle ActivityAttendeeLeftEvent for Activity {ActivityId}", e.ActivityId);
        }
    }
}

public sealed class ActivityLifecycleAuditEventHandler(
    ILogger<ActivityLifecycleAuditEventHandler> logger)
    : INotificationHandler<DomainEventNotification<ActivityCreatedEvent>>,
      INotificationHandler<DomainEventNotification<ActivityDetailsUpdatedEvent>>
{
    public Task Handle(
        DomainEventNotification<ActivityCreatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: Activity {ActivityId} ({Title}) created",
            e.EventId, e.ActivityId, e.Title);
        return Task.CompletedTask;
    }

    public Task Handle(
        DomainEventNotification<ActivityDetailsUpdatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation("DomainEvent {EventId}: Activity {ActivityId} ({Title}) details updated",
            e.EventId, e.ActivityId, e.Title);
        return Task.CompletedTask;
    }
}
