namespace Core.Application.Feature.Activities.Queries.GetActivityList;

public record ActivityDto
{
    public required string ID { get; init; }
    public required string Title { get; init; }
    public required string Slug { get; init; }
    public DateTimeOffset Date { get; init; }
    public required string Description { get; init; }
    public required string Category { get; init; }
    public bool IsCancelled { get; init; }
    public required string City { get; init; }
    public required string Venue { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public required string Image { get; init; }
    public required string Level { get; init; }
    public List<string> Tags { get; init; } = [];
    public string? HostUsername { get; init; }
    public string? HostDisplayName { get; init; }
    public ICollection<AttendeeDto> Attendees { get; init; } = [];
}
