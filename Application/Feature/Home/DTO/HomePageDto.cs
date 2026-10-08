using Domain;

namespace Application.Feature.Home.DTO;

public record HomePageDto
{
    public Activity? FeaturedActivity { get; init; }
    public List<Activity> UpcomingActivities { get; init; } = [];
    public HomeStatsDto Stats { get; init; } = new();
}

public record HomeStatsDto
{
    public int ActiveDevelopers { get; init; }
    public int TotalEvents { get; init; }
    public int TechTracks { get; init; }
}
