using Application.Activities.DTO;
using Application.Activities.Validators;
using Application.Core;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public static class EditActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
        public required EditActivityDto ActivityDto { get; set; }
    }

    public class CommandValidator : BaseActivityValidator<Command, EditActivityDto>
    {
        public CommandValidator() : base(x => x.ActivityDto)
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Activity ID is required");
        }
    }

    public class Handler(DevMeetDbContext context, IMapper mapper) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .FindAsync([request.Id], cancellationToken);

            if (activity == null) return Result<Unit>.NotFound("Activity not found");

            mapper.Map(request.ActivityDto, activity);
            activity.Slug = Domain.Common.SlugHelper.GenerateSlug(activity.Title);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!result) return Result<Unit>.Failure("Failed to update activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
