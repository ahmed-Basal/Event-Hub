using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Module.Domain;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Commands;

public sealed class FollowToggleRequest
{
    public string Username { get; init; } = string.Empty;
}

public sealed class FollowToggleEndpoint(
    ProfilesDbContext db,
    IIdentityDirectory identity,
    ICurrentUser currentUser)
    : Endpoint<FollowToggleRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/profiles/{username}/follow");
    }

    public override async Task HandleAsync(FollowToggleRequest req, CancellationToken ct)
    {
        var observerId = currentUser.UserId;
        var target = await identity.GetByUsernameAsync(req.Username, ct);

        if (target is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Target user not found."), 404, ct);
            return;
        }

        if (target.Id == observerId)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.BadRequest, "You cannot follow yourself."), 400, ct);
            return;
        }

        var existing = await db.UserFollowings
            .FirstOrDefaultAsync(f => f.ObserverId == observerId && f.TargetId == target.Id, ct);

        if (existing is not null)
        {
            existing.MarkUnfollowed();
            db.UserFollowings.Remove(existing);
            await db.SaveChangesAsync(ct);
            await Send.OkAsync(ApiResponse<string>.Ok("Unfollowed."), ct);
            return;
        }

        db.UserFollowings.Add(UserFollowing.Create(observerId, target.Id));
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Followed."), ct);
    }
}
