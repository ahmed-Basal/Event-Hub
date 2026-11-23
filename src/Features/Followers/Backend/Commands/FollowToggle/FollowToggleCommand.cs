using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Followers.Commands.FollowToggle;

public class FollowToggleCommand : IRequest<Response<bool>>
{
    public required string TargetUsername { get; set; }
}

public class FollowToggleCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<FollowToggleCommand, Response<bool>>
{
    public async Task<Response<bool>> Handle(
        FollowToggleCommand request,
        CancellationToken cancellationToken)
    {
        var observer = await userAccessor.GetUserAsync();
        var target = await dbContext.Users
            .FirstOrDefaultAsync(
                u => u.UserName == request.TargetUsername || u.Id == request.TargetUsername,
                cancellationToken);

        if (target is null)
        {
            return NotFound<bool>("Target user not found.");
        }

        if (observer.Id == target.Id)
        {
            return BadRequest<bool>("You cannot follow yourself.");
        }

        var existing = await dbContext.UserFollowings
            .FirstOrDefaultAsync(
                f => f.ObserverId == observer.Id && f.TargetId == target.Id,
                cancellationToken);

        bool nowFollowing;
        if (existing is null)
        {
            dbContext.UserFollowings.Add(UserFollowing.Create(observer.Id, target.Id));
            nowFollowing = true;
        }
        else
        {
            existing.MarkUnfollowed();
            dbContext.UserFollowings.Remove(existing);
            nowFollowing = false;
        }

        var saved = await dbContext.SaveChangesAsync(cancellationToken) > 0;
        if (!saved)
        {
            return BadRequest<bool>("Failed to update following status.");
        }

        return Success(nowFollowing);
    }
}
