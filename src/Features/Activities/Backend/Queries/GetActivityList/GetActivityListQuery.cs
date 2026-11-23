using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.Queries.GetActivityList;

public class GetActivityListQuery : IRequest<Response<List<ActivityDto>>>
{
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
    public DateTimeOffset? Date { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public string? Filter { get; set; } // all | isGoing | isHost | isFollowing
    public string? Search { get; set; }
    public string? City { get; set; }
    public string? Pricing { get; set; } // all | free | paid
    public string? SortBy { get; set; } // date | popular | priceAsc | priceDesc
}
