using Application.Feature.Activities.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.Queries.Models;

public class GetActivityDetailsQuery : IRequest<Response<ActivityDto>>
{
    public required string ID { get; set; }
}
