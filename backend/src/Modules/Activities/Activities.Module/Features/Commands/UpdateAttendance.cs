using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace Activities.Module.Features.Commands;

public sealed class UpdateAttendanceRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class UpdateAttendanceEndpoint(
    ActivitiesDbContext db,
    ICurrentUser currentUser,
    IOutputCacheStore outputCache)
    : Endpoint<UpdateAttendanceRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/activities/{id}/attend");
    }

    public override async Task HandleAsync(UpdateAttendanceRequest req, CancellationToken ct)
    {
        var activity = await db.Activities
            .Include(a => a.Attendees)
            .Include(a => a.Waitlist)
            .FirstOrDefaultAsync(a => a.Id == req.Id || a.Slug == req.Id, ct);

        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        var userId = currentUser.UserId;
        var existing = activity.Attendees.FirstOrDefault(a => a.UserId == userId);
        string message;

        if (existing is not null)
        {
            if (existing.IsHost)
            {
                if (activity.IsCancelled)
                {
                    activity.Reactivate(userId);
                    message = "Activity reactivated.";
                }
                else
                {
                    activity.Cancel(userId);
                    message = "Activity cancelled.";
                }
            }
            else
            {
                activity.RemoveAttendee(userId);
                var promotedUserId = activity.PopNextWaitlistedUser();
                message = promotedUserId is not null
                    ? "Attendance removed and next waitlisted user promoted."
                    : "Attendance removed.";
            }
        }
        else if (activity.Waitlist.Any(w => w.UserId == userId))
        {
            activity.LeaveWaitlist(userId);
            message = "Removed from waitlist.";
        }
        else if (activity.IsFull)
        {
            activity.JoinWaitlist(userId);
            message = "Activity is at capacity; you have been added to the waitlist.";
        }
        else
        {
            activity.AddAttendee(userId, isHost: false);
            message = "Attendance updated.";
        }

        await db.SaveChangesAsync(ct);
        await outputCache.EvictByTagAsync("activities", ct);

        await Send.OkAsync(ApiResponse<string>.Ok(message), ct);
    }
}
