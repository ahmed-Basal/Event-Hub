using System.Security.Claims;
using Application.Interfaces;
using BuildingBlocks.Contracts;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, IAppDbContext appDbContext)
    : IUserAccessor, ICurrentUser
{
    string? ICurrentUser.UserId => GetUserIdOrNull();
    string? ICurrentUser.Username => GetUsername();
    string? ICurrentUser.Email => GetEmail();
    bool ICurrentUser.IsAuthenticated => httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated == true;
    bool ICurrentUser.IsInRole(string role) => httpContextAccessor.HttpContext?.User.IsInRole(role) == true;
    public string? GetEmail()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("email");
    }

    public string? GetUsername()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("preferred_username")
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("name");
    }

    public string? GetUserIdOrNull()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
    }

    public string GetUserId()
    {
        return GetUserIdOrNull()
            ?? throw new UnauthorizedAccessException("User is not authenticated");
    }

    public async Task<User> GetUserAsync()
    {
        var userId = GetUserId();

        var user = await appDbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user ?? throw new UnauthorizedAccessException(
            $"Authenticated subject '{userId}' is not provisioned in the local profile store.");
    }

    public string? GetIpAddress()
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        if (httpContext.Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
        {
            return forwarded.ToString().Split(',')[0].Trim();
        }
        return httpContext.Connection.RemoteIpAddress?.ToString();
    }

    public string? GetRefreshToken()
    {
        return httpContextAccessor.HttpContext?.Request.Cookies["refreshToken"];
    }
}
