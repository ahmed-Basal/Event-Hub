using Activities.Contracts;
using Comments.Module.Domain;
using DevMeet.Shared.Events;
using Identity.Contracts;
using Notifications.Contracts;

namespace Comments.Module.Features.Events;

public sealed class CommentCreatedEventHandler(
    IActivitiesDirectory activities,
    IIdentityDirectory identity,
    INotificationPublisher notifications)
    : IDomainEventHandler<CommentCreatedEvent>
{
    public async Task HandleAsync(CommentCreatedEvent e, CancellationToken ct = default)
    {
        var activity = await activities.GetByIdAsync(e.ActivityId, ct);
        if (activity?.HostId is null || activity.HostId == e.UserId) return;

        var actor = await identity.GetByIdAsync(e.UserId, ct);
        await notifications.SendAsync(
            activity.HostId,
            NotificationType.NewComment,
            $"{actor?.DisplayName ?? "Someone"} commented on '{activity.Title}'.",
            e.UserId,
            $"/activities/{activity.Id}",
            ct);
    }
}
