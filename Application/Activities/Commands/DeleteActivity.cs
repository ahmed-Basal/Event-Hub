using Application.Core;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public static class DeleteActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Activity ID is required");
        }
    }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .FindAsync([request.Id], cancellationToken);

            if (activity == null) return Result<Unit>.NotFound("Activity not found");

            context.Remove(activity);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!result) return Result<Unit>.Failure("Failed to delete activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
