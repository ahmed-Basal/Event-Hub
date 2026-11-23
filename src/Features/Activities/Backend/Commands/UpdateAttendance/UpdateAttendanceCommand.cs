using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Activities.Commands.UpdateAttendance;

public class UpdateAttendanceCommand : IRequest<Response<string>>
{
    public required string ActivityId { get; set; }
}

public class UpdateAttendanceCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<UpdateAttendanceCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        UpdateAttendanceCommand request,
        CancellationToken cancellationToken)
    {
        var activity = await dbContext.Activities
            .Include(a => a.Attendees)
            .FirstOrDefaultAsync(
                a => a.Id == request.ActivityId || a.Slug == request.ActivityId,
                cancellationToken);

        if (activity is null)
        {
            return NotFound<string>("Activity not found.");
        }

        var user = await userAccessor.GetUserAsync();
        var attendance = activity.Attendees.FirstOrDefault(x => x.UserId == user.Id);
        var isHost = attendance?.IsHost == true;

        if (attendance is not null)
        {
            if (isHost)
            {
                if (activity.IsCancelled)
                    activity.Reactivate(user.Id);
                else
                    activity.Cancel(user.Id);
            }
            else
            {
                activity.RemoveAttendee(user.Id);
            }
        }
        else
        {
            activity.AddAttendee(user.Id);
        }

        var saved = await dbContext.SaveChangesAsync(cancellationToken) > 0;
        if (!saved)
        {
            return BadRequest<string>("Problem updating attendance.");
        }

        return Success(activity.ID);
    }
}
