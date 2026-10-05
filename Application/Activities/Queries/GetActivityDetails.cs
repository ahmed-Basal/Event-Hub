using Application.Activities.DTO;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities.Queries;

public static class GetActivityDetails
{
    public class Query : IRequest<Result<ActivityDto>>
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

    public class Handler(IAppDbContext context, IMapper mapper) : IRequestHandler<Query, Result<ActivityDto>>
    {
        public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                .Where(x => x.ID == request.ID || x.Slug == request.ID)
                .ProjectTo<ActivityDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (activity == null)
            {
                return Result<ActivityDto>.NotFound("Activity not found");
            }
            return Result<ActivityDto>.Success(activity);
        }
    }
}
