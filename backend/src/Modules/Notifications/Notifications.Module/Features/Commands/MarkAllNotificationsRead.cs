using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Features.Commands;

public sealed class MarkAllNotificationsReadEndpoint(NotificationsDbContext db, ICurrentUser currentUser)
    : EndpointWithoutRequest<ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/notifications/read-all");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var unread = await db.Notifications
            .Where(n => n.RecipientId == currentUser.UserId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var item in unread) item.MarkAsRead();
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("All notifications marked as read."), ct);
    }
}
