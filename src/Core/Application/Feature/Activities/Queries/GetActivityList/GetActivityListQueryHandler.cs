using AutoMapper;
using AutoMapper.QueryableExtensions;
using Core.Application.Bases;
using Core.Application.Interfaces;
using Core.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Feature.Activities.Queries.GetActivityList;

/// <summary>
/// Handles retrieving activities list with optional filtering and pagination.
/// Orchestrates query execution adhering to Single Responsibility Principle (SRP).
/// </summary>
public class GetActivityListQueryHandler(IAppDbContext context, IMapper mapper)
    : ResponseHandler, IRequestHandler<GetActivityListQuery, Response<List<ActivityDto>>>
{
    public async Task<Response<List<ActivityDto>>> Handle(
        GetActivityListQuery request, 
        CancellationToken cancellationToken)
    {
        var query = context.Activities.AsNoTracking()
            .FilterByCategory(request.Category)
            .FilterByStatus(request.Status)
            .FilterByDate(request.Date)
            .OrderByUpcoming();

        if (request.PageNumber.HasValue || request.PageSize.HasValue)
        {
            var pagination = new PaginationParams(request.PageNumber, request.PageSize);
            var (items, meta) = await query.ToPagedResultAsync<Activity, ActivityDto>(
                pagination, 
                mapper.ConfigurationProvider, 
                cancellationToken);

            return Success(items, meta);
        }

        var allActivities = await query
            .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Success(allActivities);
    }
}
