namespace Payments.Module.Domain;

public sealed class ProcessedWebhookEvent
{
    private ProcessedWebhookEvent() { }

    public string EventId { get; private set; } = string.Empty;
    public string EventType { get; private set; } = string.Empty;
    public string? OrderId { get; private set; }
    public DateTimeOffset ProcessedAtUtc { get; private set; } = DateTimeOffset.UtcNow;

    public static ProcessedWebhookEvent Create(string eventId, string eventType, string? orderId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(eventId, nameof(eventId));
        ArgumentException.ThrowIfNullOrWhiteSpace(eventType, nameof(eventType));

        return new ProcessedWebhookEvent
        {
            EventId = eventId.Trim(),
            EventType = eventType.Trim(),
            OrderId = string.IsNullOrWhiteSpace(orderId) ? null : orderId.Trim(),
            ProcessedAtUtc = DateTimeOffset.UtcNow
        };
    }
}
