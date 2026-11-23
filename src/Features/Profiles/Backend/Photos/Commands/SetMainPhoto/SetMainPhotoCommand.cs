using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Photos.Commands.SetMainPhoto;

public class SetMainPhotoCommand : IRequest<Response<string>>
{
    public required string PhotoId { get; set; }
}

public class SetMainPhotoCommandHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<SetMainPhotoCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        SetMainPhotoCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userAccessor.GetUserAsync();
        var userPhotos = await dbContext.Photos
            .Where(p => p.UserId == user.Id)
            .ToListAsync(cancellationToken);

        var target = userPhotos.FirstOrDefault(p => p.Id == request.PhotoId);
        if (target is null)
        {
            return NotFound<string>("Photo not found.");
        }

        user.SetMainPhoto(target, userPhotos);

        await dbContext.SaveChangesAsync(cancellationToken);
        return Success(target.Url);
    }
}
