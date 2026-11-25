using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Profiles.Contracts;

namespace Activities.Module.Features.Queries;

public sealed class GetActivityDetailsRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class GetActivityDetailsEndpoint(
    ActivitiesDbContext db,
    IIdentityDirectory identity,
    IProfilesDirectory profiles,
    ICurrentUser currentUser)
    : Endpoint<GetActivityDetailsRequest, ApiResponse<ActivityDto>>
{
    public override void Configure()
    {
        Get("/api/activities/{id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetActivityDetailsRequest req, CancellationToken ct)
    {
        var activity = await db.Activities.AsNoTracking()
            .Include(a => a.Attendees)
            .Include(a => a.Waitlist)
            .FirstOrDefaultAsync(a => a.Id == req.Id || a.Slug == req.Id, ct);

        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<ActivityDto>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        var dtos = await ActivityMapper.MapToDtosAsync([activity], identity, profiles, currentUser.UserIdOrNull, ct);
        await Send.OkAsync(ApiResponse<ActivityDto>.Ok(dtos[0]), ct);
    }
}
