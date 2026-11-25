using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace Activities.Module.Features.Commands;

public sealed class DeleteActivityRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class DeleteActivityEndpoint(ActivitiesDbContext db, IOutputCacheStore outputCache)
    : Endpoint<DeleteActivityRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Delete("/api/activities/{id}");
        Policies(IsHostRequirement.PolicyName);
    }

    public override async Task HandleAsync(DeleteActivityRequest req, CancellationToken ct)
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

        await Send.OkAsync(ApiResponse<string>.Ok("Activity deleted."), ct);
    }
}
