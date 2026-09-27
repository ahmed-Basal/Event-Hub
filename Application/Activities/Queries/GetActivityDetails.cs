using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public static class GetActivityDetails
{
    public class Query : IRequest<Activity?>
    {
        public required string Id { get; set; }
    }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Query, Activity?>
    {
        public async Task<Activity?> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Activities
                .FirstOrDefaultAsync(x => x.ID == request.Id || x.Slug == request.Id, cancellationToken);
        }
    }
}
