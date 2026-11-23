using System.Buffers.Text;
using System.Text;
using Application.Bases;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Feature.Account.Commands.ForgotPassword;

public class ForgotPasswordCommand : IRequest<Response<string>>
{
    public required string Email { get; set; }
}

public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ForgotPasswordCommandHandler(
    UserManager<User> userManager,
    IEmailService emailService,
    IConfiguration configuration)
    : ResponseHandler, IRequestHandler<ForgotPasswordCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Success("If an account exists with that email, a password reset link has been sent.");
        }

        var rawCode = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedCode = Base64Url.EncodeToString(Encoding.UTF8.GetBytes(rawCode));
        var clientAppUrl = configuration["ClientAppUrl"] ?? "http://localhost:3000";
        var link = $"{clientAppUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(user.Email!)}&code={Uri.EscapeDataString(encodedCode)}";

        await emailService.SendPasswordResetAsync(user, link, cancellationToken);
        return Success("If an account exists with that email, a password reset link has been sent.");
    }
}
