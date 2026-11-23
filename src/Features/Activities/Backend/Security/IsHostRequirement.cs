using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;

public sealed class IsHostRequirement : IAuthorizationRequirement
{
    public const string PolicyName = "IsActivityHost";
}

public class IsHostRequirementHandler(
    IAppDbContext dbContext,
    IHttpContextAccessor httpContextAccessor)
    : AuthorizationHandler<IsHostRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        IsHostRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
        {
            return;
        }

        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext?.GetRouteValue("id") is not string activityId)
        {
            return;
        }

        var isHost = await dbContext.ActivityAttendees
            .AsNoTracking()
            .AnyAsync(a =>
                (a.ActivityId == activityId || a.Activity.Slug == activityId) &&
                a.UserId == userId &&
                a.IsHost);

        if (isHost)
        {
            context.Succeed(requirement);
        }
    }
}
