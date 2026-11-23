using Application.Bases;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Comments.Commands.CreateComment;

public class CreateCommentCommand : IRequest<Response<CommentDto>>
{
    public required string ActivityId { get; set; }
    public required string Body { get; set; }
}

public class CreateCommentValidator : AbstractValidator<CreateCommentCommand>
{
    public CreateCommentValidator()
    {
        RuleFor(x => x.ActivityId).NotEmpty();
        RuleFor(x => x.Body).NotEmpty().MaximumLength(2000);
    }
}

public class CreateCommentCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<CreateCommentCommand, Response<CommentDto>>
{
    public async Task<Response<CommentDto>> Handle(
        CreateCommentCommand request,
        CancellationToken cancellationToken)
    {
        var activity = await dbContext.Activities
            .FirstOrDefaultAsync(
                a => a.Id == request.ActivityId || a.Slug == request.ActivityId,
                cancellationToken);

        if (activity is null)
        {
            return NotFound<CommentDto>("Activity not found.");
        }

        var user = await userAccessor.GetUserAsync();
        var comment = Comment.Create(activity.ID, user.Id, request.Body);

        dbContext.Comments.Add(comment);
        var saved = await dbContext.SaveChangesAsync(cancellationToken) > 0;
        if (!saved)
        {
            return BadRequest<CommentDto>("Failed to save comment.");
        }

        return Success(new CommentDto
        {
            Id = comment.Id,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UserId = user.Id,
            Username = user.UserName ?? user.Id,
            DisplayName = user.DisplayName ?? user.UserName ?? "User",
            Image = user.Picture
        });
    }
}
