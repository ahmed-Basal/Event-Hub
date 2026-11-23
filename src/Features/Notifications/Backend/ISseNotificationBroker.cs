using Application.Feature.Notifications;

namespace Application.Interfaces;

public interface ISseNotificationBroker
{
    string CreateTicket(string userId);
    string? RedeemTicket(string ticket);
    IAsyncEnumerable<NotificationDto> SubscribeAsync(string userId, CancellationToken ct);
    ValueTask PublishAsync(string userId, NotificationDto notification, CancellationToken ct = default);
}
