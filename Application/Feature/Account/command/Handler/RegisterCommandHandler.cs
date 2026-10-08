using Application.Feature.Account.DTO;
using Application.Bases;
using Application.Feature.Account.command.Models;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Account.command.Handler;

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
        var dto = request.RegisterDto;

        if (await userManager.Users.AnyAsync(x => x.Email == dto.Email, cancellationToken))
        {
            return BadRequest<UserDto>("Email is already taken.");
        }

        if (await userManager.Users.AnyAsync(x => x.UserName == dto.Username, cancellationToken))
        {
            return BadRequest<UserDto>("Username is already taken.");
        }

        var user = mapper.Map<User>(dto);

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest<UserDto>(errors);
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
