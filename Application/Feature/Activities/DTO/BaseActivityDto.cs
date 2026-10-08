namespace Application.Feature.Activities.DTO;

public class BaseActivityDto
{
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public required string City { get; set; }
    public required string Venue { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Image { get; set; }
    public string? Level { get; set; }
    public List<string>? Tags { get; set; }
}
