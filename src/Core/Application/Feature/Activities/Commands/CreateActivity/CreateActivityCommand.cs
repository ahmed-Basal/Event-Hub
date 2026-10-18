using Core.Application.Bases;
using Core.Application.Feature.Activities.Commands.Base;
using MediatR;

namespace Core.Application.Feature.Activities.Commands.CreateActivity;

public record CreateActivityCommand : BaseActivityCommand, IRequest<Response<string>>
{
}
