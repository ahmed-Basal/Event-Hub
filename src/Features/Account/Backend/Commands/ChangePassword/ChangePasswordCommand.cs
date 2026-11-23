using Application.Bases;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Commands.ChangePassword;

public class ChangePasswordCommand : IRequest<Response<string>>
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}

public class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}

public class ChangePasswordCommandHandler(
    UserManager<User> userManager,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<ChangePasswordCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userAccessor.GetUserAsync();
        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest<string>(
                "Failed to change password.",
                result.Errors.Select(e => e.Description).ToList());
        }

        return Success("Password updated successfully.");
    }
}
