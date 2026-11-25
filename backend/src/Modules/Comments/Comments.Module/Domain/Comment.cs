using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using DevMeet.Shared.Events;

namespace Comments.Module.Domain;

public sealed class Comment : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private Comment() { }

    public string Id { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public string UserId { get; private set; } = string.Empty;
    public string ActivityId { get; private set; } = string.Empty;

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

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

        comment._domainEvents.Add(new CommentCreatedEvent(comment.Id, comment.ActivityId, comment.UserId, comment.Body));
        return comment;
    }

    public void EditBody(string newBody)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newBody, nameof(newBody));
        Body = newBody.Trim();
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
}
