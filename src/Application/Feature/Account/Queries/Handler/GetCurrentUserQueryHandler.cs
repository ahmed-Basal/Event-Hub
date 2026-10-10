using Application.Feature.Account.DTO;
using Application.Bases;
using Application.Feature.Account.Queries.Models;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Queries.Handler;

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

        var userDto = mapper.Map<UserDto>(user);
        userDto.Token = tokenService.CreateToken(user);

        return Success(userDto);
    }
}
