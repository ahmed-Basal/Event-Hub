using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Profiles.Queries.GetProfile;

public class GetProfileQuery : IRequest<Response<UserProfileDto>>
{
    public required string Username { get; set; }
}

public class GetProfileQueryHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetProfileQuery, Response<UserProfileDto>>
{
    public async Task<Response<UserProfileDto>> Handle(
        GetProfileQuery request,
        CancellationToken cancellationToken)
    {
        var currentUserId = userAccessor.GetUserIdOrNull();

        var profile = await dbContext.Users
            .AsNoTracking()
            .Where(u => u.UserName == request.Username || u.Id == request.Username)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                Username = u.UserName ?? u.Id,
                DisplayName = u.DisplayName ?? u.UserName ?? "User",
                Bio = u.Bio,
                Image = u.Picture,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Followings.Count,
                Following = currentUserId != null && u.Followers.Any(f => f.ObserverId == currentUserId),
                Photos = u.Photos
                    .OrderByDescending(p => p.IsMain)
                    .Select(p => new PhotoDto
                    {
                        Id = p.Id,
                        Url = p.Url,
                        IsMain = p.IsMain
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return profile is null
            ? NotFound<UserProfileDto>("Profile not found.")
            : Success(profile);
    }
}
