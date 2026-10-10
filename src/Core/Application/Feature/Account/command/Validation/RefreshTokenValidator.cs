using Core.Application.Feature.Account.command.Models;
using FluentValidation;

namespace Core.Application.Feature.Account.command.Validation;

public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}
