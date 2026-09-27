using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public static class GetActivityDetails
{
    public class Query : IRequest<Result<Activity>>
    {
        public required string Id { get; set; }
    }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Query, Result<Activity>>
    {
        public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
        {
           var  acctivity=await context.findasync(typeof(Activity),request.Id) as Activity;
           if(acctivity==null)
           {
            return Result<Activity>.Failure("Activity not found");
           }
           return Result<Activity>.Success(acctivity);
        }
    }
}
