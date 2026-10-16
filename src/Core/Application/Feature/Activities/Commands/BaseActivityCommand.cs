namespace Core.Application.Feature.Activities.Commands;

public abstract record BaseActivityCommand
{
    public required string Title { get; init; }
    public DateTime Date { get; init; }
    public required string Description { get; init; }
    public required string Category { get; init; }
    public required string City { get; init; }
    public required string Venue { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public string? Image { get; init; }
    public string? Level { get; init; }
    public List<string>? Tags { get; init; }
}
