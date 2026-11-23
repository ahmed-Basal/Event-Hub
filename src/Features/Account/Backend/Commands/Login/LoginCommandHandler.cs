using Application.Bases;
using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Commands.Login;

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
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized<UserDto>("Invalid email or password.");
        }

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return Unauthorized<UserDto>("Invalid email or password.");
        }

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var userDto = mapper.Map<UserDto>(user);
        userDto.Roles = roles;
        userDto.Token = tokenService.CreateToken(user, roles);

        var ipAddress = userAccessor.GetIpAddress();
        var refreshToken = tokenService.GenerateRefreshToken(user.Id, ipAddress);
        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        userDto.RefreshToken = refreshToken.Token;

        return Success(userDto);
    }
}
