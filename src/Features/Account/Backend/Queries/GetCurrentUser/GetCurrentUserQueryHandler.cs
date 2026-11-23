using Application.Bases;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler(
    IUserAccessor userAccessor,
    UserManager<User> userManager,
    ITokenService tokenService,
    IMapper mapper)
    : ResponseHandler, IRequestHandler<GetCurrentUserQuery, Response<UserDto>>
{
    public async Task<Response<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var username = userAccessor.GetUsername();
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized<UserDto>("User not found.");
        }

        var user = await userManager.FindByNameAsync(username);
        if (user is null)
        {
            return Unauthorized<UserDto>("User not found.");
        }

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var userDto = mapper.Map<UserDto>(user);
        userDto.Roles = roles;
        userDto.Token = tokenService.CreateToken(user, roles);

        return Success(userDto);
    }
}
