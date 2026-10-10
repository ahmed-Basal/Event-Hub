using Core.Application.Feature.Account.DTO;
using Core.Application.Bases;
using Core.Application.Feature.Account.command.Models;
using Core.Application.Interfaces;
using AutoMapper;
using Core.Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Core.Application.Feature.Account.command.Handler;

public class LoginCommandHandler(
    UserManager<User> userManager,
    ITokenService tokenService,
    IAppDbContext dbContext,
    IMapper mapper,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<LoginCommand, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.LoginDto.Email);
        if (user is null)
        {
            return Unauthorized<UserDto>("Invalid email or password.");
        }

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.LoginDto.Password);
        if (!isPasswordValid)
        {
            return Unauthorized<UserDto>("Invalid email or password.");
        }

        var userDto = mapper.Map<UserDto>(user);
        userDto.Token = tokenService.CreateToken(user);

        var ipAddress = userAccessor.GetIpAddress();
        var refreshToken = tokenService.GenerateRefreshToken(user.Id, ipAddress);
        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        userDto.RefreshToken = refreshToken.Token;

        return Success(userDto);
    }
}
