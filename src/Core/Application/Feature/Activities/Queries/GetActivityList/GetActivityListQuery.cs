using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Activities.Queries.GetActivityList;

public class GetActivityListQuery : IRequest<Response<List<ActivityDto>>>
{
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
    public DateTime? Date { get; set; }
}
