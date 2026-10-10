using Core.Application.Feature.Activities.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Activities.command.Models;

public class EditActivityCommand : IRequest<Response<Unit>>
{
    public required string ID { get; set; }
    public required EditActivityDto ActivityDto { get; set; }
}
