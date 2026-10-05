using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace API.Services;

public class UserAccessor(IHttpContextAccessor httpContextAccessor) : IUserAccessor
{
    public string? GetEmail()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
    }

    public string? GetUsername()
    {
        return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
    }
}
