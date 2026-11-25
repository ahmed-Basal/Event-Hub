using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Contracts;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Queries;

public sealed class GetFollowingsRequest
{
    public string Username { get; init; } = string.Empty;
    [QueryParam] public string Predicate { get; init; } = "followers";
}

public sealed class GetFollowingsEndpoint(
    ProfilesDbContext db,
    IIdentityDirectory identity,
    IProfilesDirectory profiles,
    ICurrentUser currentUser)
    : Endpoint<GetFollowingsRequest, ApiResponse<List<FollowerProfileDto>>>
{
    public override void Configure()
    {
        Get("/api/profiles/{username}/follow-list");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetFollowingsRequest req, CancellationToken ct)
    {
        var user = await identity.GetByUsernameAsync(req.Username, ct);
        if (user is null)
        {
            await Send.ResponseAsync(ApiResponse<List<FollowerProfileDto>>.Fail(HttpStatusCode.NotFound, "Profile not found."), 404, ct);
            return;
        }

        var targetIds = req.Predicate.Equals("following", StringComparison.OrdinalIgnoreCase)
            ? await db.UserFollowings.AsNoTracking()
                .Where(f => f.ObserverId == user.Id)
                .Select(f => f.TargetId)
                .ToListAsync(ct)
            : await db.UserFollowings.AsNoTracking()
                .Where(f => f.TargetId == user.Id)
                .Select(f => f.ObserverId)
                .ToListAsync(ct);

        if (targetIds.Count == 0)
        {
            await Send.OkAsync(ApiResponse<List<FollowerProfileDto>>.Ok([]), ct);
            return;
        }

        var users = await identity.GetByIdsAsync(targetIds, ct);
        var stats = await profiles.GetFollowStatsBatchAsync(targetIds, currentUser.UserIdOrNull, ct);

        var result = targetIds
            .Where(users.ContainsKey)
            .Select(id =>
            {
                var u = users[id];
                var s = stats.GetValueOrDefault(id, new FollowStats(0, 0, false));
                return new FollowerProfileDto(
                    u.Id,
                    u.UserName,
                    u.DisplayName,
                    u.Bio,
                    u.Picture,
                    s.FollowersCount,
                    s.FollowingCount,
                    s.IsFollowing);
            })
            .ToList();

        await Send.OkAsync(ApiResponse<List<FollowerProfileDto>>.Ok(result), ct);
    }
}
