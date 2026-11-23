using Domain.Common;

namespace Domain.Events;

public sealed record CommentCreatedEvent(
    string CommentId,
    string ActivityId,
    string AuthorUserId,
    string Body) : DomainEvent;
