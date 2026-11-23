using Domain.Common;

namespace Domain;

public enum NotificationType
{
    ActivityJoined = 1,
    ActivityLeft = 2,
    ActivityCancelled = 3,
    ActivityReactivated = 4,
    NewComment = 5,
    NewFollower = 6,
    TicketPurchased = 7
}

public sealed class Notification : BaseEntity<string>
{
    private Notification() { }

    public string RecipientId { get; private set; } = string.Empty;
    public User Recipient { get; private set; } = null!;

    public string? ActorId { get; private set; }
    public User? Actor { get; private set; }

    public NotificationType Type { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public string? TargetUrl { get; private set; }
    public bool IsRead { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public static Notification Create(
        string recipientId,
        NotificationType type,
        string message,
        string? actorId = null,
        string? targetUrl = null,
        string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(recipientId, nameof(recipientId));
        ArgumentException.ThrowIfNullOrWhiteSpace(message, nameof(message));

        return new Notification
        {
            Id = string.IsNullOrWhiteSpace(id) ? Guid.NewGuid().ToString() : id.Trim(),
            RecipientId = recipientId.Trim(),
            ActorId = string.IsNullOrWhiteSpace(actorId) ? null : actorId.Trim(),
            Type = type,
            Message = message.Trim(),
            TargetUrl = string.IsNullOrWhiteSpace(targetUrl) ? null : targetUrl.Trim(),
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void MarkAsRead()
    {
        if (IsRead) return;
        IsRead = true;
    }
}
