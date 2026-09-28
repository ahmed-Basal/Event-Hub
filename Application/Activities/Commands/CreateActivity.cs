using Application.Activities.DTO;
using Application.Activities.Validators;
using Application.Core;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;

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

    public class Handler(DevMeetDbContext context) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken cancellationToken)
        {
            var dto = request.ActivityDto;
            var activity = Activity.Create(
                title: dto.Title,
                description: dto.Description,
                category: dto.Category,
                date: dto.Date,
                city: dto.City,
                venue: dto.Venue,
                latitude: dto.Latitude,
                longitude: dto.Longitude,
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
