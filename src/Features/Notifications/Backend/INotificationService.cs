using Domain;

namespace Application.Interfaces;

public record NotificationRequest(
    string RecipientId,
    string? ActorId,
    NotificationType Type,
    string Message,
    string? TargetUrl = null);

public interface INotificationService
{
    Task NotifyAsync(NotificationRequest request, CancellationToken ct = default);
    Task NotifyManyAsync(IEnumerable<NotificationRequest> requests, CancellationToken ct = default);
}
