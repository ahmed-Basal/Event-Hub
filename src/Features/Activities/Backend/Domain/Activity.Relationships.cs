using Domain.Events;

namespace Domain;

public sealed partial class Activity
{
    public ICollection<ActivityAttendee> Attendees { get; set; } = new HashSet<ActivityAttendee>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ActivityAttendee AddAttendee(
        string userId,
        bool isHost = false,
        DateTimeOffset? dateJoined = null,
        bool raiseEvent = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));

        var existing = Attendees.FirstOrDefault(a => a.UserId == userId);
        if (existing is not null)
        {
            return existing;
        }

        var attendee = ActivityAttendee.Create(userId, Id, isHost, dateJoined);
        Attendees.Add(attendee);

        if (raiseEvent && !isHost)
        {
            AddDomainEvent(new ActivityAttendeeJoinedEvent(Id, Title, userId, isHost));
        }

        return attendee;
    }

    public bool RemoveAttendee(string userId, bool raiseEvent = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));

        var attendee = Attendees.FirstOrDefault(a => a.UserId == userId);
        if (attendee is null || attendee.IsHost)
        {
            return false;
        }

        Attendees.Remove(attendee);

        if (raiseEvent)
        {
            AddDomainEvent(new ActivityAttendeeLeftEvent(Id, Title, userId));
        }

        return true;
    }
}
