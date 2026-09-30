using Domain;

namespace Application.Home.DTO;

public class HomePageDto
{
    public Activity? FeaturedActivity { get; set; }
    public List<Activity> UpcomingActivities { get; set; } = [];
    public HomeStatsDto Stats { get; set; } = new();
}

public class HomeStatsDto
{
    public int ActiveDevelopers { get; set; }
    public int TotalEvents { get; set; }
    public int TechTracks { get; set; }
}
