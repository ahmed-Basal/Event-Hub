namespace Activities.Module.Domain;

public sealed partial class Activity
{
    public ActivityAttendee AddAttendee(string userId, bool isHost = false, DateTimeOffset? dateJoined = null, bool raiseEvent = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        var existing = _attendees.FirstOrDefault(a => a.UserId == userId);
        if (existing is not null) return existing;

        var attendee = ActivityAttendee.Create(userId, Id, isHost, dateJoined);
        _attendees.Add(attendee);

        if (raiseEvent && !isHost)
            _domainEvents.Add(new ActivityAttendeeJoinedEvent(Id, Title, userId, isHost));

        return attendee;
    }

    public bool RemoveAttendee(string userId, bool raiseEvent = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        var attendee = _attendees.FirstOrDefault(a => a.UserId == userId);
        if (attendee is null || attendee.IsHost) return false;

        _attendees.Remove(attendee);
        if (raiseEvent)
            _domainEvents.Add(new ActivityAttendeeLeftEvent(Id, Title, userId));

        return true;
    }

    public bool JoinWaitlist(string userId, DateTimeOffset? joinedAtUtc = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        var cleanId = userId.Trim();

        if (_attendees.Any(a => a.UserId == cleanId) || _waitlist.Any(w => w.UserId == cleanId))
            return false;

        _waitlist.Add(ActivityWaitlistEntry.Create(cleanId, Id, joinedAtUtc));
        return true;
    }

    public bool LeaveWaitlist(string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        var entry = _waitlist.FirstOrDefault(w => w.UserId == userId.Trim());
        if (entry is null) return false;

        _waitlist.Remove(entry);
        return true;
    }

    public string? PopNextWaitlistedUser()
    {
        if (IsFull || _waitlist.Count == 0) return null;

        var next = _waitlist.OrderBy(w => w.JoinedAtUtc).First();
        _waitlist.Remove(next);
        AddAttendee(next.UserId, isHost: false, raiseEvent: false);
        _domainEvents.Add(new WaitlistUserPromotedEvent(Id, Title, next.UserId));
        return next.UserId;
    }
}
