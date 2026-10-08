using Application.Bases;
using Application.Feature.Activities.command.Models;
using Application.Interfaces;
using AutoMapper;
using MediatR;

namespace Application.Feature.Activities.command.Handler;

public class EditActivityCommandHandler(
    IAppDbContext context,
    IMapper mapper)
    : ResponseHandler, IRequestHandler<EditActivityCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(EditActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await context.Activities
            .FindAsync([request.ID], cancellationToken);

        if (activity == null)
        {
            return NotFound<Unit>("Activity not found");
        }

        mapper.Map(request.ActivityDto, activity);

        var result = await context.SaveChangesAsync(cancellationToken) > 0;
        if (!result)
        {
            return BadRequest<Unit>("Failed to update activity");
        }

        return Success(Unit.Value);
    }
}
