using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Activities.Queries.GetActivityList;

public class GetActivityListQueryHandler(
    IAppDbContext context,
    IMapper mapper,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetActivityListQuery, Response<List<ActivityDto>>>
{
    public async Task<Response<List<ActivityDto>>> Handle(
        GetActivityListQuery request,
        CancellationToken cancellationToken)
    {
        var currentUserId = userAccessor.GetUserIdOrNull();

        var query = context.Activities.AsNoTracking()
            .FilterByCategory(request.Category)
            .FilterByStatus(request.Status)
            .FilterByUserRelation(request.Filter, currentUserId)
            .FilterByDate(request.Date)
            .FilterByStartDate(request.StartDate)
            .FilterBySearch(request.Search)
            .FilterByCity(request.City)
            .FilterByPricing(request.Pricing)
            .OrderByOption(request.SortBy);

        var mapperParams = new { currentUserId };

        if (request.PageNumber.HasValue || request.PageSize.HasValue)
        {
            var pagination = new PaginationParams(request.PageNumber, request.PageSize);
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, mapperParams)
                .ToListAsync(cancellationToken);

            var meta = new PaginationMeta(pagination.PageNumber, pagination.PageSize, totalCount);
            return Success(items, meta);
        }

        var allActivities = await query
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider, mapperParams)
            .ToListAsync(cancellationToken);

        return Success(allActivities);
    }
}
