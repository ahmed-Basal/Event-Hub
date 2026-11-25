using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Module.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Identity.Module.Features.Commands;

public sealed class UpdateUserRolesRequest
{
    public string Username { get; init; } = string.Empty;
    public List<string> Roles { get; init; } = [];
}

public sealed class UpdateUserRolesEndpoint(IdentityDbContext db)
    : Endpoint<UpdateUserRolesRequest, ApiResponse<List<string>>>
{
    public override void Configure()
    {
        Post("/api/admin/users/{username}/roles");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(UpdateUserRolesRequest req, CancellationToken ct)
    {
        var normalized = req.Username.Trim().ToLower();
        var user = await db.Users.FirstOrDefaultAsync(u => u.UserName.ToLower() == normalized, ct);
        if (user is null)
        {
            await Send.ResponseAsync(ApiResponse<List<string>>.Fail(HttpStatusCode.NotFound, "User not found."), 404, ct);
            return;
        }

        user.SetRoles(req.Roles);
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<List<string>>.Ok(user.Roles.ToList()), ct);
    }
}
