using System.Buffers.Text;
using System.Text;
using Application.Bases;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Account.Commands.ConfirmEmail;

public class ConfirmEmailCommand : IRequest<Response<string>>
{
    public required string UserId { get; set; }
    public required string Code { get; set; }
}

public class ConfirmEmailCommandHandler(UserManager<User> userManager)
    : ResponseHandler, IRequestHandler<ConfirmEmailCommand, Response<string>>
{
    public async Task<Response<string>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return NotFound<string>("User not found.");
        }

        string decodedCode;
        try
        {
            decodedCode = Encoding.UTF8.GetString(Base64Url.DecodeFromChars(request.Code));
        }
        catch
        {
            decodedCode = request.Code;
        }

        var result = await userManager.ConfirmEmailAsync(user, decodedCode);
        if (!result.Succeeded)
        {
            return BadRequest<string>(
                "Email confirmation failed.",
                result.Errors.Select(e => e.Description).ToList());
        }

        return Success("Email confirmed successfully.");
    }
}
