using Core.Application.Feature.Account.DTO;
using Core.Application.Bases;
using Core.Application.Feature.Account.command.Models;
using Core.Application.Interfaces;
using AutoMapper;
using Core.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Application.Feature.Account.command.Handler;

public class RefreshTokenCommandHandler(
    IAppDbContext dbContext,
    UserManager<User> userManager,
    ITokenService tokenService,
    IMapper mapper,
    ILogger<RefreshTokenCommandHandler> logger,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<RefreshTokenCommand, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenString = !string.IsNullOrWhiteSpace(request.RefreshToken)
            ? request.RefreshToken
            : userAccessor.GetRefreshToken();

        if (string.IsNullOrWhiteSpace(tokenString))
        {
            return BadRequest<UserDto>("Refresh token is required.");
        }

        var ipAddress = userAccessor.GetIpAddress();

        var existingToken = await dbContext.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == tokenString, cancellationToken);

        if (existingToken is null)
        {
            return Unauthorized<UserDto>("Invalid refresh token.");
        }

        // Senior Security Practice: Refresh Token Compromise / Reuse Detection (RFC 6819)
        // If an already-revoked token is used, assume token theft. Revoke all active sessions for this user.
        if (existingToken.IsRevoked)
        {
            logger.LogWarning("Security Alert: Potential refresh token reuse detected for User ID {UserId}. Revoking all active tokens.", existingToken.UserId);

            var activeTokens = await dbContext.RefreshTokens
                .Where(r => r.UserId == existingToken.UserId && r.RevokedAtUtc == null)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
            {
                token.RevokedAtUtc = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
                token.ReplacedByToken = "REVOKED_COMPROMISED_REUSE";
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            return Unauthorized<UserDto>("Security alert: Compromised token reuse detected. All sessions have been revoked. Please log in again.");
        }

        // Validate expiration
        if (existingToken.IsExpired)
        {
            return Unauthorized<UserDto>("Refresh token has expired. Please log in again.");
        }

        // Ensure user exists
        var user = existingToken.User ?? await userManager.FindByIdAsync(existingToken.UserId);
        if (user is null)
        {
            return Unauthorized<UserDto>("User associated with this refresh token was not found.");
        }

        // Refresh Token Rotation (RTR): Invalidate old token and issue a new cryptographically secure token
        var newRefreshToken = tokenService.GenerateRefreshToken(user.Id, ipAddress);

        existingToken.RevokedAtUtc = DateTime.UtcNow;
        existingToken.RevokedByIp = ipAddress;
        existingToken.ReplacedByToken = newRefreshToken.Token;

        dbContext.RefreshTokens.Add(newRefreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Issue new JWT Access Token & return response
        var userDto = mapper.Map<UserDto>(user);
        userDto.Token = tokenService.CreateToken(user);
        userDto.RefreshToken = newRefreshToken.Token;

        return Success(userDto);
    }
}
