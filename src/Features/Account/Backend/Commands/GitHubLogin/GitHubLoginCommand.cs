using Application.Bases;
using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Commands.GitHubLogin;

public class GitHubLoginCommand : IRequest<Response<UserDto>>
{
    public required string Code { get; set; }
}

public class GitHubLoginCommandHandler(
    UserManager<User> userManager,
    ITokenService tokenService,
    IAppDbContext dbContext,
    IMapper mapper,
    IUserAccessor userAccessor,
    IGitHubAuthService gitHubAuthService)
    : ResponseHandler, IRequestHandler<GitHubLoginCommand, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(
        GitHubLoginCommand request,
        CancellationToken cancellationToken)
    {
        var ghUser = await gitHubAuthService.ExchangeCodeAsync(request.Code, cancellationToken);
        if (ghUser is null)
        {
            return BadRequest<UserDto>("GitHub authentication failed or is not configured on the server.");
        }

        var user = await userManager.FindByEmailAsync(ghUser.Email);
        if (user is null)
        {
            user = User.Create(
                userName: ghUser.Login,
                email: ghUser.Email,
                displayName: ghUser.Name ?? ghUser.Login,
                picture: ghUser.AvatarUrl,
                emailConfirmed: true);

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return BadRequest<UserDto>(
                    "Failed to create account from GitHub.",
                    createResult.Errors.Select(e => e.Description).ToList());
            }
            await userManager.AddToRoleAsync(user, Domain.Common.AppRoles.Member);
        }

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var userDto = mapper.Map<UserDto>(user);
        userDto.Roles = roles;
        userDto.Token = tokenService.CreateToken(user, roles);

        var refreshToken = tokenService.GenerateRefreshToken(user.Id, userAccessor.GetIpAddress());
        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        userDto.RefreshToken = refreshToken.Token;

        return Success(userDto);
    }
}
