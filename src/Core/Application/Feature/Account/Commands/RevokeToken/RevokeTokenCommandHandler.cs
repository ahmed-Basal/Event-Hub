using Core.Application.Bases;
using Core.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Feature.Account.Commands.RevokeToken;

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

        existingToken.RevokedAtUtc = DateTime.UtcNow;
        existingToken.RevokedByIp = userAccessor.GetIpAddress();

        await dbContext.SaveChangesAsync(cancellationToken);

        return Success(Unit.Value);
    }
}
