using Application.Activities.DTO;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;

namespace Application.Activities.Commands;

public static class CreateActivity
{
    public class Command : IRequest<Result<string>>
    {
        public required CreateActivityDto ActivityDto { get; set; }
    }

    public class CommandValidator : BaseActivityValidator<Command, CreateActivityDto>
    {
        public CommandValidator() : base(x => x.ActivityDto)
        {
        }
    }

    public class Handler(IAppDbContext context) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var dto = request.ActivityDto;
            var category = !string.IsNullOrWhiteSpace(dto.Category) ? dto.Category.Trim() : "BackEnd";
            var image = !string.IsNullOrWhiteSpace(dto.Image)
                ? dto.Image.Trim()
                : $"/images/categoryImages/{category.ToLowerInvariant()}.jpg";

            var latitude = dto.Latitude != 0 ? dto.Latitude : 30.0444;
            var longitude = dto.Longitude != 0 ? dto.Longitude : 31.2357;

            var activity = Activity.Create(
                title: dto.Title,
                description: dto.Description,
                category: category,
                date: dto.Date,
                city: dto.City,
                venue: dto.Venue,
                latitude: latitude,
                longitude: longitude,
                image: image,
                level: dto.Level,
                tags: dto.Tags
            );

            context.Activities.Add(activity);

            var result = await context.SaveChangesAsync(cancellationToken) > 0;

            if (!result) return Result<string>.Failure("Failed to create the activity", 400);

            return Result<string>.Success(activity.ID);
        }
    }
}
