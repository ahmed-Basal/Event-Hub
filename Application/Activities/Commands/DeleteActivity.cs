using Application.Core;
using Application.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Activities.Commands;

public static class DeleteActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ID { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
        }
    }

    public class Handler(IAppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .FindAsync([request.ID], cancellationToken);

            if (activity == null) return Result<Unit>.NotFound("Activity not found");

            context.Activities.Remove(activity);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!result) return Result<Unit>.Failure("Failed to delete activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
