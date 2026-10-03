using Application.Core;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Queries;

public static class GetActivityDetails
{
    public class Query : IRequest<Result<Activity>>
    {
        public required string ID { get; set; }
    }

    public class QueryValidator : AbstractValidator<Query>
    {
        public QueryValidator()
        {
            RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
        }
    }

    public class Handler(DevMeetDbContext context) : IRequestHandler<Query, Result<Activity>>
    {
        public async Task<Result<Activity>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities.FirstOrDefaultAsync(
                x => x.ID == request.ID || x.Slug == request.ID,
                cancellationToken
            );

            if (activity == null)
            {
                return Result<Activity>.NotFound("Activity not found");
            }
            return Result<Activity>.Success(activity);
        }
    }
}
