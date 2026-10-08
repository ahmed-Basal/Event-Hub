using Application.Bases;
using Application.Feature.Account.command.Models;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Account.command.Handler;

public class RevokeTokenCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor,
    ILogger<RevokeTokenCommandHandler> logger)
    : ResponseHandler, IRequestHandler<RevokeTokenCommand, Response<string>>
{
    public async Task<Response<string>> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenString = !string.IsNullOrWhiteSpace(request.RefreshToken)
            ? request.RefreshToken
            : userAccessor.GetRefreshToken();

        if (string.IsNullOrWhiteSpace(tokenString))
        {
            return BadRequest<string>("Refresh token is required.");
        }

        var token = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == tokenString, cancellationToken);

        if (token is null)
        {
            return NotFound<string>("Refresh token not found.");
        }

        if (token.IsActive)
        {
            token.RevokedAtUtc = DateTime.UtcNow;
            token.RevokedByIp = userAccessor.GetIpAddress();
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Refresh token revoked for User ID {UserId}", token.UserId);
        }

        return Success("Refresh token revoked successfully.");
    }
}
