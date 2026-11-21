namespace Core.Domain;

public sealed partial class Activity
{
    public ICollection<ActivityAttendee> Attendees { get; set; } = new HashSet<ActivityAttendee>();
}
