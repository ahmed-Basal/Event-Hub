using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace Activities.Module.Features.Commands.Admin;

public sealed class ToggleCancelActivityRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class ToggleCancelActivityEndpoint(
    ActivitiesDbContext db,
    ICurrentUser currentUser,
    IOutputCacheStore outputCache)
    : Endpoint<ToggleCancelActivityRequest>
{
    public override void Configure()
    {
        Post("/api/admin/activities/{id}/toggle-cancel");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(ToggleCancelActivityRequest req, CancellationToken ct)
    {
        var activity = await db.Activities.Include(a => a.Attendees)
            .FirstOrDefaultAsync(a => a.Id == req.Id || a.Slug == req.Id, ct);

        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<bool>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        if (activity.IsCancelled) activity.Reactivate(currentUser.UserId);
        else activity.Cancel(currentUser.UserId);

        await db.SaveChangesAsync(ct);
        await outputCache.EvictByTagAsync("activities", ct);

        await Send.OkAsync(new { succeeded = true, isCancelled = activity.IsCancelled }, ct);
    }
}
