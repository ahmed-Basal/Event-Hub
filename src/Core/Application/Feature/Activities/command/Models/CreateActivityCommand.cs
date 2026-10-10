using Core.Application.Feature.Activities.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Activities.command.Models;

public class CreateActivityCommand : IRequest<Response<string>>
{
    public required CreateActivityDto ActivityDto { get; set; }
}
