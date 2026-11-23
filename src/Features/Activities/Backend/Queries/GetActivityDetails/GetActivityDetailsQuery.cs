using Application.Bases;
using Application.Feature.Activities.Queries.GetActivityList;
using MediatR;

namespace Application.Feature.Activities.Queries.GetActivityDetails;

public class GetActivityDetailsQuery : IRequest<Response<ActivityDto>>
{
    public required string ID { get; set; }
}
