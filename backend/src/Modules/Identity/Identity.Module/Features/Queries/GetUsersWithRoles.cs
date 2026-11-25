using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Module.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Identity.Module.Features.Queries;

public sealed record AdminUserDto(
    string Id,
    string Username,
    string DisplayName,
    string Email,
    string? Picture,
    List<string> Roles);

public sealed class GetUsersWithRolesEndpoint(IdentityDbContext db)
    : EndpointWithoutRequest<ApiResponse<List<AdminUserDto>>>
{
    public override void Configure()
    {
        Get("/api/admin/users");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var users = await db.Users
            .AsNoTracking()
            .OrderBy(u => u.UserName)
            .ToListAsync(ct);

        var result = users.Select(u => new AdminUserDto(
            u.Id,
            u.UserName,
            u.DisplayName,
            u.Email,
            u.Picture,
            u.Roles.ToList())).ToList();

        await Send.OkAsync(ApiResponse<List<AdminUserDto>>.Ok(result), ct);
    }
}
