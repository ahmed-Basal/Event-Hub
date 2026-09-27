using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public static class GetActivityList
{
    public class Query : IRequest<Result<List<Activity>>> { }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Query, Result<List<Activity>>>
    {
        public async Task<Result<List<Activity>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activities = await context.Activities.ToListAsync(cancellationToken);
            return Result<List<Activity>>.Success(activities);
        }
    }
}
