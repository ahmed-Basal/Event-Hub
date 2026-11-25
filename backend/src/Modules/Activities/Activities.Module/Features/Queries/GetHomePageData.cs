using Activities.Module.Domain;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Activities.Module.Features.Queries;

public sealed record HomeStatsDto(int ActiveDevelopers, int TotalEvents, int TechTracks);

public sealed record HomeActivityDto(
    string ID,
    string Title,
    string Slug,
    DateTimeOffset Date,
    string Description,
    string Category,
    bool IsCancelled,
    string City,
    string Venue,
    string Image,
    string Level,
    decimal Price,
    string Currency,
    int? MaxCapacity,
    List<string> Tags);

public sealed record HomePageDto(
    HomeActivityDto? FeaturedActivity,
    List<HomeActivityDto> UpcomingActivities,
    HomeStatsDto Stats);

public sealed class GetHomePageDataEndpoint(ActivitiesDbContext db)
    : EndpointWithoutRequest<ApiResponse<HomePageDto>>
{
    public override void Configure()
    {
        Get("/api/home");
        AllowAnonymous();
        Options(x => x.CacheOutput("PublicEvents"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var upcoming = await db.Activities.AsNoTracking()
            .Where(a => !a.IsCancelled && a.Date >= DateTimeOffset.UtcNow)
            .OrderBy(a => a.Date)
            .Take(4)
            .ToListAsync(ct);

        if (upcoming.Count == 0)
        {
            upcoming = await db.Activities.AsNoTracking()
                .Where(a => !a.IsCancelled)
                .OrderByDescending(a => a.Date)
                .Take(4)
                .ToListAsync(ct);
        }

        var totalEvents = await db.Activities.CountAsync(ct);
        var techTracksCount = await db.Activities
            .Where(a => !string.IsNullOrEmpty(a.Category))
            .Select(a => a.Category)
            .Distinct()
            .CountAsync(ct);

        var mapped = upcoming.Select(MapToHomeDto).ToList();
        var dto = new HomePageDto(
            mapped.FirstOrDefault(),
            mapped.Skip(1).ToList(),
            new HomeStatsDto(1200, totalEvents, techTracksCount > 0 ? techTracksCount : 5));

        await Send.OkAsync(ApiResponse<HomePageDto>.Ok(dto), ct);
    }

    private static HomeActivityDto MapToHomeDto(Activity a) => new(
        a.Id,
        a.Title,
        a.Slug,
        a.Date,
        a.Description,
        a.Category,
        a.IsCancelled,
        a.City,
        a.Venue,
        a.Image,
        a.Level,
        a.Price,
        a.Currency,
        a.MaxCapacity,
        a.Tags.ToList());
}
