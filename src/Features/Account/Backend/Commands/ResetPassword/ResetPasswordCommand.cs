using System.Buffers.Text;
using System.Text;
using Application.Bases;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Commands.ResetPassword;

public class ResetPasswordCommand : IRequest<Response<string>>
{
    public required string Email { get; set; }
    public required string ResetCode { get; set; }
    public required string NewPassword { get; set; }
}

public class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.ResetCode).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(6);
    }
}

public class ResetPasswordCommandHandler(UserManager<User> userManager)
    : ResponseHandler, IRequestHandler<ResetPasswordCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return BadRequest<string>("Invalid reset request.");
        }

        string decodedCode;
        try
        {
            decodedCode = Encoding.UTF8.GetString(Base64Url.DecodeFromChars(request.ResetCode));
        }
        catch
        {
            decodedCode = request.ResetCode;
        }

        var result = await userManager.ResetPasswordAsync(user, decodedCode, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest<string>(
                "Password reset failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        return Success("Password has been reset successfully.");
    }
}
