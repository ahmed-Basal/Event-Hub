using Core.Application.Bases;
using Core.Application.Feature.Home.Queries.Models;
using Core.Application.Feature.Home.DTO;
using Core.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Feature.Home.Queries.Handler;

public class GetHomePageDataQueryHandler(IAppDbContext context)
    : ResponseHandler, IRequestHandler<GetHomePageDataQuery, Response<HomePageDto>>
{
    public async Task<Response<HomePageDto>> Handle(GetHomePageDataQuery request, CancellationToken cancellationToken)
    {
        var upcoming = await context.Activities
            .Where(a => !a.IsCancelled && a.Date >= DateTime.UtcNow)
            .OrderBy(a => a.Date)
            .Take(4)
            .ToListAsync(cancellationToken);

        if (upcoming.Count == 0)
        {
            upcoming = await context.Activities
                .Where(a => !a.IsCancelled)
                .OrderByDescending(a => a.Date)
                .Take(4)
                .ToListAsync(cancellationToken);
        }

        var totalEvents = await context.Activities.CountAsync(cancellationToken);
        var techTracksCount = await context.Activities
            .Where(a => !string.IsNullOrEmpty(a.Category))
            .Select(a => a.Category)
            .Distinct()
            .CountAsync(cancellationToken);

        var result = new HomePageDto
        {
            FeaturedActivity = upcoming.FirstOrDefault(),
            UpcomingActivities = upcoming.Skip(1).ToList(),
            Stats = new HomeStatsDto
            {
                ActiveDevelopers = 1200,
                TotalEvents = totalEvents,
                TechTracks = techTracksCount > 0 ? techTracksCount : 5
            }
        };

        return Success(result);
    }
}
