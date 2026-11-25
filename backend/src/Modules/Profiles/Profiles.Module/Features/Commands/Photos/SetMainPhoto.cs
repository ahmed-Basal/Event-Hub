using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Commands.Photos;

public sealed class SetMainPhotoRequest
{
    public string PhotoId { get; init; } = string.Empty;
}

public sealed class SetMainPhotoEndpoint(
    ProfilesDbContext db,
    IIdentityDirectory identity,
    ICurrentUser currentUser)
    : Endpoint<SetMainPhotoRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Put("/api/profiles/{photoId}/setMain");
    }

    public override async Task HandleAsync(SetMainPhotoRequest req, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        var photos = await db.Photos.Where(p => p.UserId == userId).ToListAsync(ct);
        var target = photos.FirstOrDefault(p => p.Id == req.PhotoId);

        if (target is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Photo not found."), 404, ct);
            return;
        }

        foreach (var photo in photos)
        {
            if (photo.Id == target.Id) photo.MarkAsMain();
            else photo.UnmarkAsMain();
        }

        await db.SaveChangesAsync(ct);
        await identity.UpdatePictureAsync(userId, target.Url, ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Main photo updated."), ct);
    }
}
