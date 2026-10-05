using Application.Activities.DTO;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;

namespace Application.Activities.Commands;

public static class EditActivity
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string ID { get; set; }
        public required EditActivityDto ActivityDto { get; set; }
    }

    public class CommandValidator : BaseActivityValidator<Command, EditActivityDto>
    {
        public CommandValidator() : base(x => x.ActivityDto)
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

            var dto = request.ActivityDto;
            var category = !string.IsNullOrWhiteSpace(dto.Category) ? dto.Category.Trim() : activity.Category;
            var image = !string.IsNullOrWhiteSpace(dto.Image)
                ? dto.Image.Trim()
                : (!string.IsNullOrWhiteSpace(activity.Image)
                    ? activity.Image
                    : $"/images/categoryImages/{category.ToLowerInvariant()}.jpg");

            var latitude = dto.Latitude != 0 ? dto.Latitude : activity.Latitude;
            var longitude = dto.Longitude != 0 ? dto.Longitude : activity.Longitude;

            activity.UpdateDetails(
                dto.Title,
                dto.Description,
                category,
                dto.Date,
                dto.Level,
                image,
                dto.Tags
            );
            activity.UpdateLocation(
                dto.City,
                dto.Venue,
                latitude,
                longitude
            );

            var result = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!result) return Result<Unit>.Failure("Failed to update activity", 400);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
