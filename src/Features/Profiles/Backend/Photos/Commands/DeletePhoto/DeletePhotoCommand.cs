using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Photos.Commands.DeletePhoto;

public class DeletePhotoCommand : IRequest<Response<string>>
{
    public required string PhotoId { get; set; }
}

public class DeletePhotoCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor,
    IPhotoAccessor photoAccessor)
    : ResponseHandler, IRequestHandler<DeletePhotoCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        DeletePhotoCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userAccessor.GetUserAsync();
        var photo = await dbContext.Photos
            .FirstOrDefaultAsync(p => p.Id == request.PhotoId && p.UserId == user.Id, cancellationToken);

        if (photo is null)
        {
            return NotFound<string>("Photo not found.");
        }

        if (photo.IsMain)
        {
            return BadRequest<string>("You cannot delete your main photo.");
        }

        await photoAccessor.DeletePhotoAsync(photo.Id, cancellationToken);
        dbContext.Photos.Remove(photo);

        var saved = await dbContext.SaveChangesAsync(cancellationToken) > 0;
        return saved ? Deleted<string>("Photo deleted successfully.") : BadRequest<string>("Problem deleting photo.");
    }
}
