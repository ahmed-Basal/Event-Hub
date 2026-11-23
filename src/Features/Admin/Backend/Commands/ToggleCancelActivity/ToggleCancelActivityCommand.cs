using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Admin.Commands.ToggleCancelActivity;

public class ToggleCancelActivityCommand : IRequest<Response<bool>>
{
    public required string ActivityId { get; set; }
}

public class ToggleCancelActivityCommandHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<ToggleCancelActivityCommand, Response<bool>>
{
    public async Task<Response<bool>> Handle(
        ToggleCancelActivityCommand request,
        CancellationToken cancellationToken)
    {
        var activity = await dbContext.Activities
            .FirstOrDefaultAsync(a => a.Id == request.ActivityId, cancellationToken);

        if (activity is null)
        {
            return NotFound<bool>("Activity not found.");
        }

        if (activity.IsCancelled)
            activity.Reactivate();
        else
            activity.Cancel();

        await dbContext.SaveChangesAsync(cancellationToken);
        return Success(activity.IsCancelled);
    }
}
