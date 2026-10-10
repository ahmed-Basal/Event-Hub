namespace Core.Domain;

public partial class Activity
{
    public ICollection<ActivityAttendee> Attendees { get; set; } = new HashSet<ActivityAttendee>();
}
