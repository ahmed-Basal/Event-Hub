using Application.Feature.Account.command.Models;
using FluentValidation;

namespace Application.Feature.Account.command.Validation;

public class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.LoginDto).NotNull().WithMessage("Login payload is required.");

        RuleFor(x => x.LoginDto.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.LoginDto.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}
