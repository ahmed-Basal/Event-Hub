using Application.Account.DTO;
using Application.Account.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Account.Commands;

public static class Login
{
    public class Command : IRequest<Result<UserDto>>
    {
        public required LoginDto LoginDto { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.LoginDto).SetValidator(new LoginValidator());
        }
    }

    public class Handler(
        UserManager<User> userManager,
        ITokenService tokenService) : IRequestHandler<Command, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByEmailAsync(request.LoginDto.Email);
            if (user is null)
            {
                return Result<UserDto>.Failure("Invalid email or password.", 401);
            }

            var isPasswordValid = await userManager.CheckPasswordAsync(user, request.LoginDto.Password);
            if (!isPasswordValid)
            {
                return Result<UserDto>.Failure("Invalid email or password.", 401);
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
