using Domain.Common;
using Domain.Events;

namespace Domain;

public sealed class Comment : BaseEntity<string>
{
    private Comment() { }

    public string Body { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public string UserId { get; private set; } = string.Empty;
    public User User { get; private set; } = null!;

    public string ActivityId { get; private set; } = string.Empty;
    public Activity Activity { get; private set; } = null!;

    public static Comment Create(
        string activityId,
        string userId,
        string body,
        DateTimeOffset? createdAt = null,
        string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(activityId, nameof(activityId));
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        ArgumentException.ThrowIfNullOrWhiteSpace(body, nameof(body));

        var comment = new Comment
        {
            Id = string.IsNullOrWhiteSpace(id) ? Guid.NewGuid().ToString() : id.Trim(),
            ActivityId = activityId.Trim(),
            UserId = userId.Trim(),
            Body = body.Trim(),
            CreatedAt = createdAt?.ToUniversalTime() ?? DateTimeOffset.UtcNow
        };

        comment.AddDomainEvent(new CommentCreatedEvent(
            comment.Id, comment.ActivityId, comment.UserId, comment.Body));

        return comment;
    }

    public void EditBody(string newBody)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newBody, nameof(newBody));
        Body = newBody.Trim();
    }
}
