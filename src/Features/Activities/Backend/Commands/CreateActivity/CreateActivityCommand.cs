using Application.Bases;
using Application.Feature.Activities.Commands.Base;
using MediatR;

namespace Application.Feature.Activities.Commands.CreateActivity;

public record CreateActivityCommand : BaseActivityCommand, IRequest<Response<string>>
{
}
