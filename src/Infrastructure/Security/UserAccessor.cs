using System.Security.Claims;
using Core.Application.Interfaces;
using Core.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;

public class UserAccessor(IHttpContextAccessor httpContextAccessor, IAppDbContext appDbContext) : IUserAccessor
{
    public string? GetEmail()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
    }

    public string? GetUsername()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
    }

    public string GetUserId()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User is not authenticated");
    }

    public async Task<User> GetUserAsync()
    {
        var userId = GetUserId();
        return await appDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new UnauthorizedAccessException("User not found in database");
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
