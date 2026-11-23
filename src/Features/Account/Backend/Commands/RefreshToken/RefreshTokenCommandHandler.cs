using Application.Bases;
using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Account.Commands.RefreshToken;

public class RefreshTokenCommandHandler(
    UserManager<User> userManager,
    ITokenService tokenService,
    IAppDbContext dbContext,
    IMapper mapper,
    IUserAccessor userAccessor,
    ILogger<RefreshTokenCommandHandler> logger)
    : ResponseHandler, IRequestHandler<RefreshTokenCommand, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
        {
            return Unauthorized<UserDto>("Refresh token is required.");
        }

        var existingToken = await dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken, cancellationToken);

        if (existingToken is null)
        {
            return Unauthorized<UserDto>("Invalid or expired refresh token.");
        }

        var ipAddress = userAccessor.GetIpAddress();

        // Detect refresh token reuse: if a previously revoked token is presented, revoke all active tokens for that user.
        if (existingToken.IsRevoked)
        {
            logger.LogWarning(
                "Refresh token reuse detected for User {UserId} from IP {IpAddress}. Revoking all active refresh tokens.",
                existingToken.UserId, ipAddress ?? "unknown");

            var activeTokens = await dbContext.RefreshTokens
                .Where(t => t.UserId == existingToken.UserId && t.RevokedAtUtc == null)
                .ToListAsync(cancellationToken);

            foreach (var active in activeTokens)
            {
                active.Revoke(ipAddress);
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return Unauthorized<UserDto>("Invalid or expired refresh token.");
        }

        if (!existingToken.IsActive || existingToken.User is null)
        {
            return Unauthorized<UserDto>("Invalid or expired refresh token.");
        }

        var user = existingToken.User;
        var newRefreshToken = tokenService.GenerateRefreshToken(user.Id, ipAddress);
        existingToken.Revoke(ipAddress, newRefreshToken.Token);

        dbContext.RefreshTokens.Add(newRefreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var userDto = mapper.Map<UserDto>(user);
        userDto.Roles = roles;
        userDto.Token = tokenService.CreateToken(user, roles);
        userDto.RefreshToken = newRefreshToken.Token;

        return Success(userDto);
    }
}
