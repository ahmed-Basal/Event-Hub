using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace Activities.Module.Features.Commands.Admin;

public sealed class DeleteActivityAsAdminRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class DeleteActivityAsAdminEndpoint(ActivitiesDbContext db, IOutputCacheStore outputCache)
    : Endpoint<DeleteActivityAsAdminRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Delete("/api/admin/activities/{id}");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(DeleteActivityAsAdminRequest req, CancellationToken ct)
    {
        var activity = await db.Activities
            .FirstOrDefaultAsync(a => a.Id == req.Id || a.Slug == req.Id, ct);

        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        db.Activities.Remove(activity);
        await db.SaveChangesAsync(ct);
        await outputCache.EvictByTagAsync("activities", ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Activity deleted by admin."), ct);
    }
}
