using Application.Feature.Activities.DTO;
using Application.Bases;
using Application.Feature.Activities.Queries.Models;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Activities.Queries.Handler;

public class GetActivityListQueryHandler(IAppDbContext context, IMapper mapper)
    : ResponseHandler, IRequestHandler<GetActivityListQuery, Response<List<ActivityDto>>>
{
    public async Task<Response<List<ActivityDto>>> Handle(GetActivityListQuery request, CancellationToken cancellationToken)
    {
        var activities = await context.Activities
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Success(activities);
    }
}
