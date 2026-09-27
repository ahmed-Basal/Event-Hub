using Application.Activities.DTO;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public static class CreateActivity
{
    public class Command : IRequest<string>
    {
        public required CreateActivityDto ActivityDto { get; set; }
    }

    public class Handler(DevMeetDbContext context, IMapper mapper) : IRequestHandler<Command, string>
    {
        public async Task<string> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = mapper.Map<Activity>(request.ActivityDto);
            activity.Slug = Domain.Common.SlugHelper.GenerateSlug(activity.Title);
            context.Activities.Add(activity);

            await context.SaveChangesAsync(cancellationToken);

            return activity.ID;
        }
    }
}
