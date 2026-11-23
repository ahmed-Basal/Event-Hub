using System.Buffers.Text;
using System.Text;
using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Application.Feature.Account.Commands.ResendConfirmationEmail;

public class ResendConfirmationEmailCommand : IRequest<Response<string>>
{
    public required string Email { get; set; }
}

public class ResendConfirmationEmailCommandHandler(
    UserManager<User> userManager,
    IEmailService emailService,
    IConfiguration configuration)
    : ResponseHandler, IRequestHandler<ResendConfirmationEmailCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        ResendConfirmationEmailCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            // Prevent user enumeration
            return Success("If an account exists with this email, a confirmation link has been sent.");
        }

        var rawCode = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedCode = Base64Url.EncodeToString(Encoding.UTF8.GetBytes(rawCode));
        var clientAppUrl = configuration["ClientAppUrl"] ?? "http://localhost:3000";
        var link = $"{clientAppUrl.TrimEnd('/')}/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(encodedCode)}";

        await emailService.SendEmailConfirmationAsync(user, link, cancellationToken);
        return Success("Confirmation email sent.");
    }
}
