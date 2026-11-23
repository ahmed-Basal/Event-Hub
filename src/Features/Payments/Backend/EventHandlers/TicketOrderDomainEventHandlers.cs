using System.Diagnostics;
using Application.Common.Events;
using Application.Interfaces;
using Application.Observability;
using Domain;
using Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Payments.EventHandlers;

public sealed class TicketOrderPaidEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<TicketOrderPaidEventHandler> logger)
    : INotificationHandler<DomainEventNotification<TicketOrderPaidEvent>>
{
    public async Task Handle(
        DomainEventNotification<TicketOrderPaidEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        var mode = string.IsNullOrWhiteSpace(e.PaymentIntentId) || e.PaymentIntentId.StartsWith("pi_sandbox_", StringComparison.OrdinalIgnoreCase)
            ? "sandbox"
            : "stripe";
        DevMeetTelemetry.PaymentsTotal.Add(1, new TagList { { "outcome", "paid" }, { "mode", mode } });
        try
        {
            var activity = await dbContext.Activities
                .AsNoTracking()
                .Where(a => a.Id == e.ActivityId)
                .Select(a => new
                {
                    a.Title,
                    HostUserId = a.Attendees
                        .Where(att => att.IsHost && att.UserId != null)
                        .Select(att => att.UserId!)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (activity is null) return;

            var targetUrl = $"/activities/{e.ActivityId}";
            var requests = new List<NotificationRequest>
            {
                new(
                    e.UserId,
                    null,
                    NotificationType.TicketPurchased,
                    $"Payment confirmed (${e.Amount:0.##})! Your spot for \"{activity.Title}\" is reserved.",
                    targetUrl)
            };

            if (!string.IsNullOrWhiteSpace(activity.HostUserId) && activity.HostUserId != e.UserId)
            {
                var buyerName = await dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.Id == e.UserId)
                    .Select(u => u.DisplayName ?? u.UserName)
                    .FirstOrDefaultAsync(cancellationToken) ?? "Someone";

                requests.Add(new NotificationRequest(
                    activity.HostUserId,
                    e.UserId,
                    NotificationType.TicketPurchased,
                    $"{buyerName} purchased a ticket (${e.Amount:0.##}) for \"{activity.Title}\".",
                    targetUrl));
            }

            await notificationService.NotifyManyAsync(requests, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle TicketOrderPaidEvent for Order {OrderId}", e.OrderId);
        }
    }
}

public sealed class TicketOrderRefundedEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<TicketOrderRefundedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<TicketOrderRefundedEvent>>
{
    public async Task Handle(
        DomainEventNotification<TicketOrderRefundedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        DevMeetTelemetry.PaymentsTotal.Add(1, new TagList { { "outcome", "refunded" }, { "mode", "stripe" } });
        try
        {
            var activityTitle = await dbContext.Activities
                .AsNoTracking()
                .Where(a => a.Id == e.ActivityId)
                .Select(a => a.Title)
                .FirstOrDefaultAsync(cancellationToken) ?? "Activity";

            await notificationService.NotifyAsync(
                new NotificationRequest(
                    e.UserId,
                    null,
                    NotificationType.ActivityCancelled,
                    $"Your ticket (${e.Amount:0.##}) for \"{activityTitle}\" has been refunded.",
                    $"/activities/{e.ActivityId}"),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle TicketOrderRefundedEvent for Order {OrderId}", e.OrderId);
        }
    }
}

public sealed class TicketOrderLifecycleAuditEventHandler(
    ILogger<TicketOrderLifecycleAuditEventHandler> logger)
    : INotificationHandler<DomainEventNotification<TicketOrderCreatedEvent>>,
      INotificationHandler<DomainEventNotification<TicketOrderFailedEvent>>
{
    public Task Handle(
        DomainEventNotification<TicketOrderCreatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        logger.LogInformation(
            "DomainEvent {EventId}: TicketOrder {OrderId} created for Activity {ActivityId} by User {UserId} ({Amount} {Currency})",
            e.EventId, e.OrderId, e.ActivityId, e.UserId, e.Amount, e.Currency);
        return Task.CompletedTask;
    }

    public Task Handle(
        DomainEventNotification<TicketOrderFailedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        DevMeetTelemetry.PaymentsTotal.Add(1, new TagList { { "outcome", "failed" }, { "mode", "stripe" } });
        logger.LogWarning(
            "DomainEvent {EventId}: TicketOrder {OrderId} failed for Activity {ActivityId} by User {UserId}",
            e.EventId, e.OrderId, e.ActivityId, e.UserId);
        return Task.CompletedTask;
    }
}
