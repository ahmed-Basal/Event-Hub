using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Admin.Commands.DeleteActivityAsAdmin;

public class DeleteActivityAsAdminCommand : IRequest<Response<Unit>>
{
    public required string ActivityId { get; set; }
}

public class DeleteActivityAsAdminCommandHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<DeleteActivityAsAdminCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(
        DeleteActivityAsAdminCommand request,
        CancellationToken cancellationToken)
    {
        var activity = await dbContext.Activities
            .FirstOrDefaultAsync(a => a.Id == request.ActivityId, cancellationToken);

        if (activity is null)
        {
            return NotFound<Unit>("Activity not found.");
        }

        dbContext.Activities.Remove(activity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Success(Unit.Value, "Activity deleted.");
    }
}
