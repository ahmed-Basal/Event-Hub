using Domain.Common;
using Domain.Events;

namespace Domain;

public sealed class UserFollowing : BaseEntity
{
    private UserFollowing() { }

    public string ObserverId { get; private set; } = string.Empty;
    public User Observer { get; private set; } = null!;

    public string TargetId { get; private set; } = string.Empty;
    public User Target { get; private set; } = null!;

    public static UserFollowing Create(string observerId, string targetId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(observerId, nameof(observerId));
        ArgumentException.ThrowIfNullOrWhiteSpace(targetId, nameof(targetId));

        if (string.Equals(observerId.Trim(), targetId.Trim(), StringComparison.Ordinal))
        {
            throw new InvalidOperationException("A user cannot follow themselves.");
        }

        var following = new UserFollowing
        {
            ObserverId = observerId.Trim(),
            TargetId = targetId.Trim()
        };

        following.AddDomainEvent(new UserFollowedEvent(following.ObserverId, following.TargetId));
        return following;
    }

    public void MarkUnfollowed()
    {
        AddDomainEvent(new UserUnfollowedEvent(ObserverId, TargetId));
    }
}
