using Core.Application.Feature.Account.command.Models;
using FluentValidation;

namespace Core.Application.Feature.Account.command.Validation;

public class RevokeTokenValidator : AbstractValidator<RevokeTokenCommand>
{
    public RevokeTokenValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}
