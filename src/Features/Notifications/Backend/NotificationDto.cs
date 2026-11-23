namespace Application.Feature.Notifications;

public record NotificationDto
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public required string Message { get; init; }
    public string? TargetUrl { get; init; }
    public string? ActorUsername { get; init; }
    public string? ActorDisplayName { get; init; }
    public string? ActorImage { get; init; }
    public bool IsRead { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}

public record NotificationsEnvelopeDto
{
    public int UnreadCount { get; init; }
    public List<NotificationDto> Items { get; init; } = [];
}
