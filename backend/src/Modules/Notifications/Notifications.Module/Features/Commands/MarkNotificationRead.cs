using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Features.Commands;

public sealed class MarkNotificationReadRequest
{
    public string Id { get; init; } = string.Empty;
}

public sealed class MarkNotificationReadEndpoint(NotificationsDbContext db, ICurrentUser currentUser)
    : Endpoint<MarkNotificationReadRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/notifications/{id}/read");
    }

    public override async Task HandleAsync(MarkNotificationReadRequest req, CancellationToken ct)
    {
        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == req.Id && n.RecipientId == currentUser.UserId, ct);

        if (notification is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Notification not found."), 404, ct);
            return;
        }

        notification.MarkAsRead();
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Marked as read."), ct);
    }
}
