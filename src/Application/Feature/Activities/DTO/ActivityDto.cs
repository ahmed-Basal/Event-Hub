namespace Application.Feature.Activities.DTO;

public class ActivityDto
{
    public required string ID { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public DateTime Date { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public bool IsCancelled { get; set; }
    public required string City { get; set; }
    public required string Venue { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public required string Image { get; set; }
    public required string Level { get; set; }
    public List<string> Tags { get; set; } = [];
    public string? HostUsername { get; set; }
    public string? HostDisplayName { get; set; }
    public ICollection<AttendeeDto> Attendees { get; set; } = [];
}
