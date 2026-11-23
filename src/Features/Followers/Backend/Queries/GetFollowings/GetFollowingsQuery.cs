using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Followers.Queries.GetFollowings;

public class GetFollowingsQuery : IRequest<Response<List<FollowerProfileDto>>>
{
    public required string Username { get; set; }
    public string Predicate { get; set; } = "followers"; // followers | followings
}

public class GetFollowingsQueryHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetFollowingsQuery, Response<List<FollowerProfileDto>>>
{
    public async Task<Response<List<FollowerProfileDto>>> Handle(
        GetFollowingsQuery request,
        CancellationToken cancellationToken)
    {
        var currentUserId = userAccessor.GetUserIdOrNull();

        var targetUser = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.UserName == request.Username || u.Id == request.Username,
                cancellationToken);

        if (targetUser is null)
        {
            return NotFound<List<FollowerProfileDto>>("User not found.");
        }

        var isFollowers = request.Predicate.Equals("followers", StringComparison.OrdinalIgnoreCase);

        var profiles = isFollowers
            ? await dbContext.UserFollowings
                .AsNoTracking()
                .Where(f => f.TargetId == targetUser.Id)
                .Select(f => new FollowerProfileDto
                {
                    Id = f.Observer.Id,
                    Username = f.Observer.UserName ?? f.Observer.Id,
                    DisplayName = f.Observer.DisplayName ?? f.Observer.UserName ?? "User",
                    Bio = f.Observer.Bio,
                    Image = f.Observer.Picture,
                    FollowersCount = f.Observer.Followers.Count,
                    FollowingCount = f.Observer.Followings.Count,
                    Following = currentUserId != null && f.Observer.Followers.Any(x => x.ObserverId == currentUserId)
                })
                .ToListAsync(cancellationToken)
            : await dbContext.UserFollowings
                .AsNoTracking()
                .Where(f => f.ObserverId == targetUser.Id)
                .Select(f => new FollowerProfileDto
                {
                    Id = f.Target.Id,
                    Username = f.Target.UserName ?? f.Target.Id,
                    DisplayName = f.Target.DisplayName ?? f.Target.UserName ?? "User",
                    Bio = f.Target.Bio,
                    Image = f.Target.Picture,
                    FollowersCount = f.Target.Followers.Count,
                    FollowingCount = f.Target.Followings.Count,
                    Following = currentUserId != null && f.Target.Followers.Any(x => x.ObserverId == currentUserId)
                })
                .ToListAsync(cancellationToken);

        return Success(profiles);
    }
}
