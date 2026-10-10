using Core.Application.Bases;
using Core.Application.Feature.Activities.command.Models;
using Core.Application.Interfaces;
using AutoMapper;
using Core.Domain;
using MediatR;

namespace Core.Application.Feature.Activities.command.Handler;

public class CreateActivityCommandHandler(
    IAppDbContext context,
    IMapper mapper,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<CreateActivityCommand, Response<string>>
{
    public async Task<Response<string>> Handle(CreateActivityCommand request, CancellationToken cancellationToken)
    {
        var user = await userAccessor.GetUserAsync();
        if (user == null)
        {
            return NotFound<string>("User not found");
        }

        var activity = mapper.Map<Activity>(request.ActivityDto);

        var attendee = new ActivityAttendee
        {
            User = user,
            Activity = activity,
            IsHost = true
        };

        activity.Attendees.Add(attendee);
        context.Activities.Add(activity);

        var result = await context.SaveChangesAsync(cancellationToken) > 0;
        if (!result)
        {
            return BadRequest<string>("Failed to create the activity");
        }

        return Success(activity.ID);
    }
}
