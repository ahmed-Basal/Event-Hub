using Application.Feature.Activities.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.Queries.Models;

public class GetActivityListQuery : IRequest<Response<List<ActivityDto>>>
{
}
