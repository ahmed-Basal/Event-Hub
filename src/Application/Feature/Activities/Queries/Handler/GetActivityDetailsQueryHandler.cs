using Application.Feature.Activities.DTO;
using Application.Bases;
using Application.Feature.Activities.Queries.Models;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Activities.Queries.Handler;

public class GetActivityDetailsQueryHandler(IAppDbContext context, IMapper mapper)
    : ResponseHandler, IRequestHandler<GetActivityDetailsQuery, Response<ActivityDto>>
{
    public async Task<Response<ActivityDto>> Handle(GetActivityDetailsQuery request, CancellationToken cancellationToken)
    {
        var activity = await context.Activities
            .Where(x => x.ID == request.ID || x.Slug == request.ID)
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        if (activity == null)
        {
            return NotFound<ActivityDto>("Activity not found");
        }

        return Success(activity);
    }
}
