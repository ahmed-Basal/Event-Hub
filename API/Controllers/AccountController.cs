using Application.Account.Commands;
using Application.Account.DTO;
using Application.Account.Queries;
using API.Extensions;
using Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace API.Controllers;

public class AccountController(ISender mediator, IOptions<JwtOptions> jwtOptions) : BaseApiController
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto, CancellationToken ct)
    {
        var result = await mediator.Send(new Login.Command { LoginDto = loginDto }, ct);
        if (result.IsSuccess && result.Value is not null && !string.IsNullOrEmpty(result.Value.Token))
        {
            SetTokenCookie(result.Value.Token);
        }
        return HandleResult(result);
    }

    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto, CancellationToken ct)
    {
        var result = await mediator.Send(new Register.Command { RegisterDto = registerDto }, ct);
        if (result.IsSuccess && result.Value is not null && !string.IsNullOrEmpty(result.Value.Token))
        {
            SetTokenCookie(result.Value.Token);
        }
        return HandleResult(result);
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser(CancellationToken ct)
    {
        return HandleResult(await mediator.Send(new GetCurrentUser.Query(), ct));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwtToken", new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.None,
            Secure = true
        });
        return Ok(new { message = "Logged out successfully" });
    }

    private void SetTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(_jwtOptions.ExpirationInDays),
            SameSite = SameSiteMode.None,
            Secure = true,
            IsEssential = true
        };
        Response.Cookies.Append("jwtToken", token, cookieOptions);
    }
}
