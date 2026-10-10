using Core.Application.Bases;
using Core.Application.Feature.Activities.command.Models;
using Core.Application.Interfaces;
using MediatR;

namespace Core.Application.Feature.Activities.command.Handler;

public class DeleteActivityCommandHandler(IAppDbContext context)
    : ResponseHandler, IRequestHandler<DeleteActivityCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(DeleteActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await context.Activities
            .FindAsync([request.ID], cancellationToken);

        if (activity == null)
        {
            return NotFound<Unit>("Activity not found");
        }

        context.Activities.Remove(activity);

        var result = await context.SaveChangesAsync(cancellationToken) > 0;
        if (!result)
        {
            return BadRequest<Unit>("Failed to delete activity");
        }

        return Success(Unit.Value);
    }
}
