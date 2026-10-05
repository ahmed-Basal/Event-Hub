using Application.Account.DTO;
using Application.Account.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Account.Commands;

public static class Register
{
    public class Command : IRequest<Result<UserDto>>
    {
        public required RegisterDto RegisterDto { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.RegisterDto).SetValidator(new RegisterValidator());
        }
    }

    public class Handler(
        UserManager<User> userManager,
        ITokenService tokenService) : IRequestHandler<Command, Result<UserDto>>
    {
        public async Task<Result<UserDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var dto = request.RegisterDto;

            if (await userManager.Users.AnyAsync(x => x.Email == dto.Email, cancellationToken))
            {
                return Result<UserDto>.Failure("Email is already taken.", 400);
            }

            if (await userManager.Users.AnyAsync(x => x.UserName == dto.Username, cancellationToken))
            {
                return Result<UserDto>.Failure("Username is already taken.", 400);
            }

            var user = new User
            {
                DisplayName = dto.DisplayName,
                Email = dto.Email,
                UserName = dto.Username,
                Picture = "/images/user.png"
            };

            var result = await userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return Result<UserDto>.Failure(errors, 400);
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
