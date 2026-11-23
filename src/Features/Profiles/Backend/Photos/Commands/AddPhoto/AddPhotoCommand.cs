using Application.Bases;
using Application.Feature.Profiles;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Photos.Commands.AddPhoto;

public class AddPhotoCommand : IRequest<Response<PhotoDto>>
{
    public required Stream FileStream { get; set; }
    public required string FileName { get; set; }
}

public class AddPhotoCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor,
    IPhotoAccessor photoAccessor)
    : ResponseHandler, IRequestHandler<AddPhotoCommand, Response<PhotoDto>>
{
    public async Task<Response<PhotoDto>> Handle(
        AddPhotoCommand request,
        CancellationToken cancellationToken)
    {
        var uploadResult = await photoAccessor.UploadPhotoAsync(
            request.FileStream,
            request.FileName,
            cancellationToken);

        if (uploadResult is null)
        {
            return BadRequest<PhotoDto>("Failed to upload photo to Cloudinary. Verify Cloudinary credentials.");
        }

        var user = await userAccessor.GetUserAsync();
        var hasMain = await dbContext.Photos
            .AnyAsync(p => p.UserId == user.Id && p.IsMain, cancellationToken);

        var photo = Photo.Create(
            uploadResult.PublicId,
            uploadResult.Url,
            user.Id,
            isMain: !hasMain);

        if (photo.IsMain || string.IsNullOrEmpty(user.Picture))
        {
            user.UpdatePicture(photo.Url);
        }

        dbContext.Photos.Add(photo);
        var saved = await dbContext.SaveChangesAsync(cancellationToken) > 0;

        return saved
            ? Success(new PhotoDto { Id = photo.Id, Url = photo.Url, IsMain = photo.IsMain })
            : BadRequest<PhotoDto>("Problem saving photo to database.");
    }
}
