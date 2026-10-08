using Application.Feature.Activities.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.command.Models;

public class CreateActivityCommand : IRequest<Response<string>>
{
    public required CreateActivityDto ActivityDto { get; set; }
}
