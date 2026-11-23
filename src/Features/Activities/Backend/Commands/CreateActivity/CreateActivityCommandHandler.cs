using Application.Bases;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;

namespace Application.Feature.Activities.Commands.CreateActivity;

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

        var activity = mapper.Map<Activity>(request);
        activity.AddAttendee(user.Id, isHost: true);
        context.Activities.Add(activity);

        var result = await context.SaveChangesAsync(cancellationToken) > 0;
        if (!result)
        {
            return BadRequest<string>("Failed to create the activity");
        }

        return Success(activity.ID);
    }
}
