using Activities.Contracts;
using DevMeet.Shared.Events;
using Identity.Contracts;
using Notifications.Contracts;
using Payments.Module.Domain;

namespace Payments.Module.Features.Events;

public sealed class TicketOrderPaidEventHandler(
    IActivitiesDirectory activities,
    INotificationPublisher notifications,
    IIdentityDirectory identity,
    IEmailDispatcher emailDispatcher)
    : IDomainEventHandler<TicketOrderPaidEvent>
{
    public async Task HandleAsync(TicketOrderPaidEvent e, CancellationToken ct = default)
    {
        await activities.EnsureAttendeeAsync(e.ActivityId, e.UserId, ct);

        await notifications.SendAsync(
            e.UserId,
            NotificationType.TicketPurchased,
            $"Your ticket payment succeeded! Check-in code: {e.CheckInCode}",
            targetUrl: $"/activities/{e.ActivityId}",
            ct: ct);

        var user = await identity.GetByIdAsync(e.UserId, ct);
        if (!string.IsNullOrWhiteSpace(user?.Email))
        {
            var activity = await activities.GetByIdAsync(e.ActivityId, ct);
            var title = activity?.Title ?? "DevMeet Event";
            var html = $"""
                <div style="font-family:Inter,sans-serif;background:#0A0E1A;color:#FFFFFF;padding:32px;border-radius:16px;">
                    <h2 style="color:#6366F1;">Your Ticket is Confirmed!</h2>
                    <p style="color:#94A3B8;">Hi {user.DisplayName}, thank you for registering for <strong>{title}</strong>.</p>
                    <p style="color:#E2E8F0;font-size:18px;">Check-in / QR Code: <strong style="color:#10B981;">{e.CheckInCode}</strong></p>
                    <p style="color:#94A3B8;">Present this code to the event organizer at the venue.</p>
                </div>
                """;
            emailDispatcher.EnqueueEmail(user.Email, $"Ticket Confirmed: {title} ({e.CheckInCode})", html);
        }
    }
}
