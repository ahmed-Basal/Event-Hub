using Core.Application.Feature.Account.command.Models;
using Core.Application.Feature.Account.DTO;
using Core.Application.Feature.Account.Queries.Models;
using API.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

/// <summary>
/// Handles developer authentication, user registration, JWT lifecycle, and active profile resolution.
/// </summary>
public class AccountController(ISender mediator) : BaseApiController
{
    /// <summary>
    /// Authenticates a developer using email and password, issuing access and refresh tokens.
    /// </summary>
    /// <remarks>
    /// Enforces strict Fixed Window rate limiting (10 requests/minute per IP) to prevent credential brute-forcing.
    /// Returns a signed HMAC-SHA512 JWT access token (15-minute validity) alongside a 7-day refresh token.
    /// </remarks>
    /// <param name="loginDto">Credentials payload containing the developer's email address and password.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>Authenticated user profile including token and display name.</returns>
    /// <response code="200">Authentication successful, credentials verified.</response>
    /// <response code="400">Invalid email or password provided.</response>
    /// <response code="429">Rate limit exceeded due to too many failed attempts.</response>
    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult> Login([FromBody] LoginDto loginDto, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new LoginCommand { LoginDto = loginDto }, ct));
    }

    /// <summary>
    /// Registers a new developer account on the DevMeet Egypt platform.
    /// </summary>
    /// <remarks>
    /// Validates password complexity, unique username, and unique email address via FluentValidation.
    /// Rate-limited to 10 requests per minute to prevent mass registration abuse.
    /// </remarks>
    /// <param name="registerDto">Registration details payload including username, display name, email, and password.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>The newly registered developer profile and initial authentication token.</returns>
    /// <response code="200">Account created successfully.</response>
    /// <response code="400">Validation failure (duplicate email, weak password, or taken username).</response>
    /// <response code="429">Rate limit exceeded.</response>
    [AllowAnonymous]
    [EnableRateLimiting(SecurityExtensions.AuthRateLimitPolicy)]
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RegisterCommand { RegisterDto = registerDto }, ct));
    }

    /// <summary>
    /// Exchanges an existing valid refresh token for a newly issued access token.
    /// </summary>
    /// <param name="body">Payload containing the active refresh token string.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>Updated user profile with renewed access token.</returns>
    /// <response code="200">Token refreshed successfully.</response>
    /// <response code="401">Refresh token has expired, been revoked, or is invalid.</response>
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequestDto? body, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RefreshTokenCommand { RefreshToken = body?.RefreshToken }, ct));
    }

    /// <summary>
    /// Retrieves the profile details of the currently authenticated developer.
    /// </summary>
    /// <remarks>
    /// Requires an active JWT Bearer token supplied in the Authorization header.
    /// Extracts identity claims via IUserAccessor to fetch user profile data.
    /// </remarks>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>The authenticated developer's profile details.</returns>
    /// <response code="200">User profile resolved successfully.</response>
    /// <response code="401">Bearer token is missing, expired, or invalid.</response>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> GetCurrentUser(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetCurrentUserQuery(), ct));
    }

    /// <summary>
    /// Revokes the specified refresh token, ending the active session.
    /// </summary>
    /// <param name="body">Payload containing the refresh token to revoke.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>A standardized success confirmation.</returns>
    /// <response code="200">Session terminated and token revoked successfully.</response>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequestDto? body, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RevokeTokenCommand { RefreshToken = body?.RefreshToken }, ct));
    }
}
