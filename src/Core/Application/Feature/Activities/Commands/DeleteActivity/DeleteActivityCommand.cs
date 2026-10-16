using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Activities.Commands.DeleteActivity;

public record DeleteActivityCommand : IRequest<Response<Unit>>
{
    public required string ID { get; init; }
}
