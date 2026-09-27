using AutoMapper;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public static class EditActivity
{
    public class Command : IRequest
    {
        public required Activity Activity { get; set; }
    }

    public class Handler(DevMeetDbContext context, IMapper mapper) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .FindAsync([request.Activity.ID], cancellationToken)
                    ?? throw new Exception("Cannot find activity");

            mapper.Map(request.Activity, activity);
            activity.Slug = Domain.Common.SlugHelper.GenerateSlug(activity.Title);

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
