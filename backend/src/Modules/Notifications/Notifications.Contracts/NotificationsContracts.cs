namespace Notifications.Contracts;

public enum NotificationType
{
    ActivityJoined = 1,
    ActivityLeft = 2,
    ActivityCancelled = 3,
    ActivityReactivated = 4,
    NewComment = 5,
    NewFollower = 6,
    TicketPurchased = 7,
    ActivityReminder = 8,
    WaitlistPromoted = 9
}

public interface INotificationPublisher
{
    Task SendAsync(
        string recipientId,
        NotificationType type,
        string message,
        string? actorId = null,
        string? targetUrl = null,
        CancellationToken ct = default);

    Task SendToManyAsync(
        IEnumerable<string> recipientIds,
        NotificationType type,
        string message,
        string? actorId = null,
        string? targetUrl = null,
        CancellationToken ct = default);
}
