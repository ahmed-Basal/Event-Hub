using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.command.Models;

public class DeleteActivityCommand : IRequest<Response<Unit>>
{
    public required string ID { get; set; }
}
