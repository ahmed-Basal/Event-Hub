using Application.Feature.Account.command.Models;
using Application.Feature.Account.DTO;
using Application.Feature.Account.Queries.Models;
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
    public async Task<ActionResult> Login([FromBody] LoginDto loginDto, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new LoginCommand { LoginDto = loginDto }, ct));
    }

    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RegisterCommand { RegisterDto = registerDto }, ct));
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequestDto? body, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RefreshTokenCommand { RefreshToken = body?.RefreshToken }, ct));
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetCurrentUser(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetCurrentUserQuery(), ct));
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequestDto? body, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RevokeTokenCommand { RefreshToken = body?.RefreshToken }, ct));
    }
}
