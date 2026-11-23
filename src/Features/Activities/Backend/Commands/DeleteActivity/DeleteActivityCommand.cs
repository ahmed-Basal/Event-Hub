using Application.Bases;
using MediatR;

namespace Application.Feature.Activities.Commands.DeleteActivity;

public record DeleteActivityCommand : IRequest<Response<Unit>>
{
    public required string ID { get; init; }
}
