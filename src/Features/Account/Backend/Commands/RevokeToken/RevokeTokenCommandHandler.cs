using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Account.Commands.RevokeToken;

public class RevokeTokenCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<RevokeTokenCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
        {
            return BadRequest<Unit>("Refresh token is required.");
        }

        var existingToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            return BadRequest<Unit>("Invalid or already revoked refresh token.");
        }

        existingToken.Revoke(userAccessor.GetIpAddress());

        await dbContext.SaveChangesAsync(cancellationToken);

        return Success(Unit.Value);
    }
}
