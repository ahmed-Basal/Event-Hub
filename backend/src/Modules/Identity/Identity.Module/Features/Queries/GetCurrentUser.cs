using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Module.Domain;
using Identity.Module.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Identity.Module.Features.Queries;

public sealed class GetCurrentUserEndpoint(
    CurrentUserAccessor currentUser,
    IdentityDbContext db)
    : EndpointWithoutRequest<ApiResponse<UserResponseDto>>
{
    public override void Configure()
    {
        Get("/api/account");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = currentUser.UserIdOrNull;
        if (string.IsNullOrWhiteSpace(userId))
        {
            await Send.ResponseAsync(ApiResponse<UserResponseDto>.Fail(HttpStatusCode.Unauthorized, "User not authenticated."), 401, ct);
            return;
        }

        var username = currentUser.Username ?? $"user-{userId[..Math.Min(8, userId.Length)]}";
        var email = currentUser.Email ?? $"{username}@devmeet.local";
        var displayName = currentUser.DisplayName ?? username;
        var roles = currentUser.Roles;

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
        {
            user = AppUser.Create(userId, username, email, displayName, roles: roles);
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);
        }
        else
        {
            user.SyncFromKeycloak(username, email, displayName, roles.Count > 0 ? roles : null);
            await db.SaveChangesAsync(ct);
        }

        var dto = new UserResponseDto(
            user.Id,
            user.DisplayName,
            user.UserName,
            user.Picture,
            user.Roles.ToList());

        await Send.OkAsync(ApiResponse<UserResponseDto>.Ok(dto), ct);
    }
}
