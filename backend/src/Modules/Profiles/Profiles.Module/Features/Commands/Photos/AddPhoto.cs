using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Profiles.Module.Domain;
using Profiles.Module.Infrastructure;

namespace Profiles.Module.Features.Commands.Photos;

public sealed class AddPhotoRequest
{
    public IFormFile File { get; init; } = null!;
}

public sealed class AddPhotoEndpoint(
    ProfilesDbContext db,
    IPhotoAccessor photoAccessor,
    IIdentityDirectory identity,
    ICurrentUser currentUser)
    : Endpoint<AddPhotoRequest, ApiResponse<PhotoDto>>
{
    public override void Configure()
    {
        Post("/api/profiles/add-photo");
        AllowFileUploads();
    }

    public override async Task HandleAsync(AddPhotoRequest req, CancellationToken ct)
    {
        if (req.File is null || req.File.Length == 0)
        {
            await Send.ResponseAsync(ApiResponse<PhotoDto>.Fail(HttpStatusCode.BadRequest, "No file provided."), 400, ct);
            return;
        }

        await using var stream = req.File.OpenReadStream();
        var uploadResult = await photoAccessor.UploadPhotoAsync(stream, req.File.FileName, ct);
        if (uploadResult is null)
        {
            await Send.ResponseAsync(ApiResponse<PhotoDto>.Fail(HttpStatusCode.BadRequest, "Photo upload failed."), 400, ct);
            return;
        }

        var userId = currentUser.UserId;
        var hasMain = await db.Photos.AnyAsync(p => p.UserId == userId && p.IsMain, ct);
        var photo = Photo.Create(uploadResult.PublicId, uploadResult.Url, userId, isMain: !hasMain);

        db.Photos.Add(photo);
        await db.SaveChangesAsync(ct);

        if (photo.IsMain)
        {
            await identity.UpdatePictureAsync(userId, photo.Url, ct);
        }

        await Send.OkAsync(ApiResponse<PhotoDto>.Ok(new PhotoDto(photo.Id, photo.Url, photo.IsMain)), ct);
    }
}
