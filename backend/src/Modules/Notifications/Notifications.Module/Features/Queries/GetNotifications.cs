using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Features.Queries;

public sealed class GetNotificationsRequest
{
    [QueryParam] public int Take { get; init; } = 30;
}

public sealed class GetNotificationsEndpoint(
    NotificationsDbContext db,
    IIdentityDirectory identity,
    ICurrentUser currentUser)
    : Endpoint<GetNotificationsRequest, ApiResponse<List<NotificationDto>>>
{
    public override void Configure()
    {
        Get("/api/notifications");
    }

    public override async Task HandleAsync(GetNotificationsRequest req, CancellationToken ct)
    {
        var take = Math.Clamp(req.Take, 1, 100);
        var items = await db.Notifications.AsNoTracking()
            .Where(n => n.RecipientId == currentUser.UserId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

        var actorIds = items.Where(n => n.ActorId != null).Select(n => n.ActorId!).Distinct().ToList();
        var actors = await identity.GetByIdsAsync(actorIds, ct);

        var dtos = items.Select(n =>
        {
            UserSummary? actor = null;
            if (n.ActorId is not null) actors.TryGetValue(n.ActorId, out actor);
            return new NotificationDto(
                n.Id,
                n.Type.ToString(),
                n.Message,
                n.TargetUrl,
                n.IsRead,
                n.CreatedAt,
                actor?.UserName,
                actor?.DisplayName,
                actor?.Picture);
        }).ToList();

        await Send.OkAsync(ApiResponse<List<NotificationDto>>.Ok(dtos), ct);
    }
}
