using Core.Application.Bases;
using Core.Application.Feature.Activities.Queries.GetActivityList;
using MediatR;

namespace Core.Application.Feature.Activities.Queries.GetActivityDetails;

public class GetActivityDetailsQuery : IRequest<Response<ActivityDto>>
{
    public required string ID { get; set; }
}
