using DevMeet.Shared.Events;

namespace Comments.Module.Domain;

public sealed record CommentCreatedEvent(string CommentId, string ActivityId, string UserId, string Body) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
