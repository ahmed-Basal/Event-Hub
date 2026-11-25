using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using DevMeet.Shared.Events;

namespace Profiles.Module.Domain;

public sealed class UserFollowing : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private UserFollowing() { }

    public string ObserverId { get; private set; } = string.Empty;
    public string TargetId { get; private set; } = string.Empty;

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public static UserFollowing Create(string observerId, string targetId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(observerId, nameof(observerId));
        ArgumentException.ThrowIfNullOrWhiteSpace(targetId, nameof(targetId));

        if (string.Equals(observerId.Trim(), targetId.Trim(), StringComparison.Ordinal))
            throw new InvalidOperationException("A user cannot follow themselves.");

        var following = new UserFollowing
        {
            ObserverId = observerId.Trim(),
            TargetId = targetId.Trim()
        };

        following._domainEvents.Add(new UserFollowedEvent(following.ObserverId, following.TargetId));
        return following;
    }

    public void MarkUnfollowed() => _domainEvents.Add(new UserUnfollowedEvent(ObserverId, TargetId));

    public void ClearDomainEvents() => _domainEvents.Clear();
}
