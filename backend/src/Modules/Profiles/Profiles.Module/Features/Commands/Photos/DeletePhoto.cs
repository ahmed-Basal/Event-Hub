using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Commands.Photos;

public sealed class DeletePhotoRequest
{
    public string PhotoId { get; init; } = string.Empty;
}

public sealed class DeletePhotoEndpoint(
    ProfilesDbContext db,
    IPhotoAccessor photoAccessor,
    ICurrentUser currentUser)
    : Endpoint<DeletePhotoRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Delete("/api/profiles/{photoId}/photos");
    }

    public override async Task HandleAsync(DeletePhotoRequest req, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        var photo = await db.Photos.FirstOrDefaultAsync(p => p.Id == req.PhotoId && p.UserId == userId, ct);

        if (photo is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Photo not found."), 404, ct);
            return;
        }

        if (photo.IsMain)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.BadRequest, "Cannot delete main photo."), 400, ct);
            return;
        }

        await photoAccessor.DeletePhotoAsync(photo.Id, ct);
        db.Photos.Remove(photo);
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Photo deleted."), ct);
    }
}
