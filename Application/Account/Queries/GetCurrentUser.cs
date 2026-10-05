using Application.Account.DTO;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Account.Queries;

public static class GetCurrentUser
{
    public class Query : IRequest<Result<UserDto>> { }

    public class Handler(
        UserManager<User> userManager,
        ITokenService tokenService,
        IUserAccessor userAccessor) : IRequestHandler<Query, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var email = userAccessor.GetEmail();
            if (string.IsNullOrEmpty(email))
            {
                return Result<UserDto>.Failure("Unauthorized", 401);
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                return Result<UserDto>.Failure("User not found.", 404);
            }

            var userDto = new UserDto
            {
                DisplayName = user.DisplayName ?? user.UserName ?? string.Empty,
                Username = user.UserName ?? string.Empty,
                Image = user.Picture,
                Token = tokenService.CreateToken(user)
            };

            return Result<UserDto>.Success(userDto);
        }
    }
}
