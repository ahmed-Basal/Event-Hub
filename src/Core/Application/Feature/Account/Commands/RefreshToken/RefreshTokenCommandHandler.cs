using Core.Application.Bases;
using Core.Application.Feature.Account.Queries.GetCurrentUser;
using Core.Application.Interfaces;
using AutoMapper;
using Core.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Feature.Account.Commands.RefreshToken;

public class RefreshTokenCommandHandler(
    UserManager<User> userManager,
    ITokenService tokenService,
    IAppDbContext dbContext,
    IMapper mapper,
    IUserAccessor userAccessor)
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

        if (existingToken is null || !existingToken.IsActive)
        {
            return Unauthorized<UserDto>("Invalid or expired refresh token.");
        }

        var user = existingToken.User;
        var ipAddress = userAccessor.GetIpAddress();
        existingToken.RevokedAtUtc = DateTime.UtcNow;
        existingToken.RevokedByIp = ipAddress;

        var newRefreshToken = tokenService.GenerateRefreshToken(user.Id, ipAddress);
        existingToken.ReplacedByToken = newRefreshToken.Token;

        dbContext.RefreshTokens.Add(newRefreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var userDto = mapper.Map<UserDto>(user);
        userDto.Token = tokenService.CreateToken(user);
        userDto.RefreshToken = newRefreshToken.Token;

        return Success(userDto);
    }
}
