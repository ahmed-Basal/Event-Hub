using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Profiles.Queries.GetUserActivities;

public class GetUserActivitiesQuery : IRequest<Response<List<UserActivityDto>>>
{
    public required string Username { get; set; }
    public string Predicate { get; set; } = "future"; // future | past | hosting
}

public class GetUserActivitiesQueryHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<GetUserActivitiesQuery, Response<List<UserActivityDto>>>
{
    public async Task<Response<List<UserActivityDto>>> Handle(
        GetUserActivitiesQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var query = dbContext.ActivityAttendees
            .AsNoTracking()
            .Where(aa => aa.User.UserName == request.Username || aa.UserId == request.Username);

        query = request.Predicate.ToLowerInvariant() switch
        {
            "past" => query.Where(aa => aa.Activity.Date <= now),
            "hosting" => query.Where(aa => aa.IsHost),
            _ => query.Where(aa => aa.Activity.Date >= now)
        };

        var activities = await query
            .OrderBy(aa => aa.Activity.Date)
            .Select(aa => new UserActivityDto
            {
                Id = aa.Activity.Id,
                Title = aa.Activity.Title,
                Category = aa.Activity.Category,
                Date = aa.Activity.Date,
                Image = aa.Activity.Image
            })
            .ToListAsync(cancellationToken);

        return Success(activities);
    }
}
