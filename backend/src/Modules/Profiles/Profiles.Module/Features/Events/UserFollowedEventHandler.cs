using DevMeet.Shared.Events;
using Identity.Contracts;
using Notifications.Contracts;
using Profiles.Module.Domain;

namespace Profiles.Module.Features.Events;

public sealed class UserFollowedEventHandler(
    IIdentityDirectory identity,
    INotificationPublisher notifications)
    : IDomainEventHandler<UserFollowedEvent>
{
    public async Task HandleAsync(UserFollowedEvent e, CancellationToken ct = default)
    {
        var observer = await identity.GetByIdAsync(e.ObserverId, ct);
        await notifications.SendAsync(
            e.TargetId,
            NotificationType.NewFollower,
            $"{observer?.DisplayName ?? "Someone"} started following you.",
            e.ObserverId,
            $"/profiles/{observer?.UserName}",
            ct);
    }
}
