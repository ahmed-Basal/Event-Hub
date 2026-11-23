using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Comments.Queries.GetComments;

public class GetCommentsQuery : IRequest<Response<List<CommentDto>>>
{
    public required string ActivityId { get; set; }
}

public class GetCommentsQueryHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<GetCommentsQuery, Response<List<CommentDto>>>
{
    public async Task<Response<List<CommentDto>>> Handle(
        GetCommentsQuery request,
        CancellationToken cancellationToken)
    {
        var comments = await dbContext.Comments
            .AsNoTracking()
            .Where(c => c.ActivityId == request.ActivityId || c.Activity.Slug == request.ActivityId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                Body = c.Body,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId,
                Username = c.User.UserName ?? c.UserId,
                DisplayName = c.User.DisplayName ?? c.User.UserName ?? "User",
                Image = c.User.Picture
            })
            .ToListAsync(cancellationToken);

        return Success(comments);
    }
}
