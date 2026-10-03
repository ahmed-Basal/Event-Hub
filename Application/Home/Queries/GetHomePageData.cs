using Application.Core;
using Application.Home.DTO;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Home.Queries;

public static class GetHomePageData
{
    public class Query : IRequest<Result<HomePageDto>> { }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Query, Result<HomePageDto>>
    {
        public async Task<Result<HomePageDto>> Handle(Query request, CancellationToken cancellationToken)
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

            return Result<HomePageDto>.Success(result);
        }
    }
}
