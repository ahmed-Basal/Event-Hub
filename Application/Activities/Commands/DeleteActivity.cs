using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public static class DeleteActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Command,Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .FindAsync([request.Id], cancellationToken)
                    ?? throw new Exception("Cannot find activity");
                if(activity==null) return Result<Unit>.NotFound();
            context.Remove(activity);

            await context.SaveChangesAsync(cancellationToken);
            return Result<Unit>.Success(Unit.Value);
        }
    }
}
