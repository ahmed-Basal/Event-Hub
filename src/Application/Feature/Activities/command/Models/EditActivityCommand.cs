using Application.Feature.Activities.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.command.Models;

public class EditActivityCommand : IRequest<Response<Unit>>
{
    public required string ID { get; set; }
    public required EditActivityDto ActivityDto { get; set; }
}
