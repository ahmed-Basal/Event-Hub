using Application.Bases;
using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Account.Commands.Register;

public class RegisterCommandHandler(
    UserManager<User> userManager,
    ITokenService tokenService,
    IAppDbContext dbContext,
    IMapper mapper,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<RegisterCommand, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await userManager.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
        {
            return BadRequest<UserDto>("Email is already taken.");
        }

        if (await userManager.Users.AnyAsync(x => x.UserName == request.Username, cancellationToken))
        {
            return BadRequest<UserDto>("Username is already taken.");
        }

        var user = mapper.Map<User>(request);

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest<UserDto>(errors);
        }

        await userManager.AddToRoleAsync(user, Domain.Common.AppRoles.Member);
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
