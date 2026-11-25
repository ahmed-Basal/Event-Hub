using Activities.Module.Domain;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Events;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Notifications.Contracts;

namespace Activities.Module.Features.Events;

public sealed class ActivityDomainEventHandlers(
    ActivitiesDbContext db,
    INotificationPublisher notifications,
    IIdentityDirectory identity,
    IEmailDispatcher emailDispatcher)
    : IDomainEventHandler<ActivityAttendeeJoinedEvent>,
      IDomainEventHandler<ActivityAttendeeLeftEvent>,
      IDomainEventHandler<ActivityCancelledEvent>,
      IDomainEventHandler<ActivityReactivatedEvent>,
      IDomainEventHandler<ActivityDetailsUpdatedEvent>,
      IDomainEventHandler<WaitlistUserPromotedEvent>
{
    public async Task HandleAsync(ActivityAttendeeJoinedEvent e, CancellationToken ct = default)
    {
        var hostId = await db.ActivityAttendees.AsNoTracking()
            .Where(a => a.ActivityId == e.ActivityId && a.IsHost)
            .Select(a => a.UserId)
            .FirstOrDefaultAsync(ct);

        if (hostId is not null && hostId != e.UserId)
        {
            await notifications.SendAsync(
                hostId,
                NotificationType.ActivityJoined,
                $"Someone joined your activity '{e.Title}'.",
                e.UserId,
                $"/activities/{e.ActivityId}",
                ct);
        }
    }

    public async Task HandleAsync(ActivityAttendeeLeftEvent e, CancellationToken ct = default)
    {
        var hostId = await db.ActivityAttendees.AsNoTracking()
            .Where(a => a.ActivityId == e.ActivityId && a.IsHost)
            .Select(a => a.UserId)
            .FirstOrDefaultAsync(ct);

        if (hostId is not null && hostId != e.UserId)
        {
            await notifications.SendAsync(
                hostId,
                NotificationType.ActivityLeft,
                $"An attendee left '{e.Title}'.",
                e.UserId,
                $"/activities/{e.ActivityId}",
                ct);
        }
    }

    public Task HandleAsync(ActivityCancelledEvent e, CancellationToken ct = default)
        => NotifyAttendeesAsync(e.ActivityId, NotificationType.ActivityCancelled, $"Activity '{e.Title}' has been cancelled.", e.ActorUserId, ct);

    public Task HandleAsync(ActivityReactivatedEvent e, CancellationToken ct = default)
        => NotifyAttendeesAsync(e.ActivityId, NotificationType.ActivityReactivated, $"Activity '{e.Title}' has been reactivated.", e.ActorUserId, ct);

    public Task HandleAsync(ActivityDetailsUpdatedEvent e, CancellationToken ct = default)
        => NotifyAttendeesAsync(e.ActivityId, NotificationType.ActivityReactivated, $"Event '{e.Title}' details have been updated.", e.ActorUserId, ct);

    public async Task HandleAsync(WaitlistUserPromotedEvent e, CancellationToken ct = default)
    {
        await notifications.SendAsync(
            e.UserId,
            NotificationType.WaitlistPromoted,
            $"A spot opened up! You have been promoted from the waitlist to attendee for '{e.Title}'.",
            targetUrl: $"/activities/{e.ActivityId}",
            ct: ct);

        var user = await identity.GetByIdAsync(e.UserId, ct);
        if (!string.IsNullOrWhiteSpace(user?.Email))
        {
            var html = $"""
                <div style="font-family:Inter,sans-serif;background:#0A0E1A;color:#FFFFFF;padding:32px;border-radius:16px;">
                    <h2 style="color:#10B981;">You're off the waitlist!</h2>
                    <p style="color:#94A3B8;">Hi {user.DisplayName}, a seat just opened up for <strong>{e.Title}</strong> and your attendance is now confirmed.</p>
                </div>
                """;
            emailDispatcher.EnqueueEmail(user.Email, $"Spot confirmed: {e.Title}", html);
        }
    }

    private async Task NotifyAttendeesAsync(
        string activityId,
        NotificationType type,
        string message,
        string? actorId,
        CancellationToken ct)
    {
        var recipientIds = await db.ActivityAttendees.AsNoTracking()
            .Where(a => a.ActivityId == activityId)
            .Select(a => a.UserId)
            .ToListAsync(ct);

        if (recipientIds.Count > 0)
        {
            await notifications.SendToManyAsync(recipientIds, type, message, actorId, $"/activities/{activityId}", ct);
        }
    }
}
