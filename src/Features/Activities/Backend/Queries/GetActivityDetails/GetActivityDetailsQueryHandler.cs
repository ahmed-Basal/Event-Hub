using Application.Bases;
using Application.Feature.Activities.Queries.GetActivityList;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Activities.Queries.GetActivityDetails;

public class GetActivityDetailsQueryHandler(
    IAppDbContext context,
    IMapper mapper,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetActivityDetailsQuery, Response<ActivityDto>>
{
    public async Task<Response<ActivityDto>> Handle(GetActivityDetailsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = userAccessor.GetUserIdOrNull();

        var activity = await context.Activities
            .AsNoTracking()
            .Where(x => x.Id == request.ID || x.Slug == request.ID)
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, new { currentUserId })
            .FirstOrDefaultAsync(cancellationToken);

        if (activity == null)
        {
            return NotFound<ActivityDto>("Activity not found");
        }

        return Success(activity);
    }
}
