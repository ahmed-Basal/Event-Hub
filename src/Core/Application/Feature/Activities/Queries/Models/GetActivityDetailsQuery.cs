using Core.Application.Feature.Activities.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Activities.Queries.Models;

public class GetActivityDetailsQuery : IRequest<Response<ActivityDto>>
{
    public required string ID { get; set; }
}
