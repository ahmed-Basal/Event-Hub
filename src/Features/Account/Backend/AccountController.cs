using Application.Feature.Account.Commands.ChangePassword;
using Application.Feature.Account.Commands.ConfirmEmail;
using Application.Feature.Account.Commands.ForgotPassword;
using Application.Feature.Account.Commands.GitHubLogin;
using Application.Feature.Account.Commands.Login;
using Application.Feature.Account.Commands.RefreshToken;
using Application.Feature.Account.Commands.Register;
using Application.Feature.Account.Commands.ResendConfirmationEmail;
using Application.Feature.Account.Commands.ResetPassword;
using Application.Feature.Account.Commands.RevokeToken;
using Application.Feature.Account.Queries.GetCurrentUser;
using API.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

public class AccountController(ISender mediator) : BaseApiController
{
    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.Succeeded && result.Data is not null)
        {
            SetAuthCookies(result.Data.Token, result.Data.RefreshToken);
        }
        return NewResult(result);
    }

    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.Succeeded && result.Data is not null)
        {
            SetAuthCookies(result.Data.Token, result.Data.RefreshToken);
            // Fire-and-forget confirmation email link (logged in dev if Resend key not configured)
            await mediator.Send(new ResendConfirmationEmailCommand { Email = command.Email }, ct);
        }
        return NewResult(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.Succeeded && result.Data is not null)
        {
            SetAuthCookies(result.Data.Token, result.Data.RefreshToken);
        }
        return NewResult(result);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetCurrentUser(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetCurrentUserQuery(), ct));
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] RevokeTokenCommand? command, CancellationToken ct)
    {
        ClearAuthCookies();
        if (command is not null && !string.IsNullOrWhiteSpace(command.RefreshToken))
        {
            return NewResult(await mediator.Send(command, ct));
        }
        return Ok(new { succeeded = true, message = "Logged out." });
    }

    [AllowAnonymous]
    [HttpGet("confirm-email")]
    public async Task<ActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new ConfirmEmailCommand { UserId = userId, Code = code }, ct));
    }

    [AllowAnonymous]
    [HttpPost("resend-confirm-email")]
    public async Task<ActionResult> ResendConfirmEmail([FromBody] ResendConfirmationEmailCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [AllowAnonymous]
    [HttpPost("github-login")]
    public async Task<ActionResult> GitHubLogin([FromBody] GitHubLoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.Succeeded && result.Data is not null)
        {
            SetAuthCookies(result.Data.Token, result.Data.RefreshToken);
        }
        return NewResult(result);
    }

    private void SetAuthCookies(string? accessToken, string? refreshToken)
    {
        var isHttps = Request.IsHttps;
        if (!string.IsNullOrWhiteSpace(accessToken))
        {
            Response.Cookies.Append("jwtToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isHttps,
                SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            });
        }

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isHttps,
                SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            });
        }
    }

    private void ClearAuthCookies()
    {
        Response.Cookies.Delete("jwtToken", new CookieOptions { Path = "/" });
        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/" });
    }
}
