using Application.Account.Commands;
using Application.Account.DTO;
using Application.Account.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto, CancellationToken ct)
    {
        var result = await Mediator.Send(new Login.Command { LoginDto = loginDto }, ct);
        if (result.IsSuccess && result.Value is not null && !string.IsNullOrEmpty(result.Value.Token))
        {
            SetTokenCookie(result.Value.Token);
        }
        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto, CancellationToken ct)
    {
        var result = await Mediator.Send(new Register.Command { RegisterDto = registerDto }, ct);
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
        return HandleResult(await Mediator.Send(new GetCurrentUser.Query(), ct));
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
            Expires = DateTime.UtcNow.AddDays(7),
            SameSite = SameSiteMode.None,
            Secure = true,
            IsEssential = true
        };
        Response.Cookies.Append("jwtToken", token, cookieOptions);
    }
}
