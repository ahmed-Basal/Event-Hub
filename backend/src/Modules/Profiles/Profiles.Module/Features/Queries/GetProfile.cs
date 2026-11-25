using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Contracts;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Queries;

public sealed class GetProfileRequest
{
    public string Username { get; init; } = string.Empty;
}

public sealed class GetProfileEndpoint(
    ProfilesDbContext db,
    IIdentityDirectory identity,
    IProfilesDirectory profiles,
    ICurrentUser currentUser)
    : Endpoint<GetProfileRequest, ApiResponse<UserProfileDto>>
{
    public override void Configure()
    {
        Get("/api/profiles/{username}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetProfileRequest req, CancellationToken ct)
    {
        var user = await identity.GetByUsernameAsync(req.Username, ct);
        if (user is null)
        {
            await Send.ResponseAsync(ApiResponse<UserProfileDto>.Fail(HttpStatusCode.NotFound, "Profile not found."), 404, ct);
            return;
        }

        var photos = await db.Photos.AsNoTracking()
            .Where(p => p.UserId == user.Id)
            .Select(p => new PhotoDto(p.Id, p.Url, p.IsMain))
            .ToListAsync(ct);

        var stats = await profiles.GetFollowStatsAsync(user.Id, currentUser.UserIdOrNull, ct);

        var dto = new UserProfileDto(
            user.Id,
            user.UserName,
            user.DisplayName,
            user.Bio,
            user.Picture,
            stats.IsFollowing,
            stats.FollowersCount,
            stats.FollowingCount,
            photos);

        await Send.OkAsync(ApiResponse<UserProfileDto>.Ok(dto), ct);
    }
}
