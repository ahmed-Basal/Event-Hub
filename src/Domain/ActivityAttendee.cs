namespace Core.Domain;

public sealed class ActivityAttendee
{
    public string ?UserId { get; set; } 
    public string ?ActivityId { get; set; } 

    public User User { get; set; } =null!;
    public Activity Activity { get; set; } =null!;
    public bool IsHost { get; set; } 
    public DateTimeOffset DateJoined { get; set; } = DateTimeOffset.UtcNow;
}
