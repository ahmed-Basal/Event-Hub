using System.Diagnostics;
using Application.Feature.Notifications;
using Application.Interfaces;
using Application.Observability;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Notifications;

public class NotificationService(
    IAppDbContext dbContext,
    ISseNotificationBroker sseBroker) : INotificationService
{
    public Task NotifyAsync(NotificationRequest request, CancellationToken ct = default)
        => NotifyManyAsync([request], ct);

    public async Task NotifyManyAsync(IEnumerable<NotificationRequest> requests, CancellationToken ct = default)
    {
        var list = requests
            .Where(r => !string.IsNullOrWhiteSpace(r.RecipientId) && r.RecipientId != r.ActorId)
            .ToList();

        if (list.Count == 0) return;

        var actorIds = list.Where(r => r.ActorId != null).Select(r => r.ActorId!).Distinct().ToList();
        var actors = actorIds.Count > 0
            ? await dbContext.Users
                .AsNoTracking()
                .Where(u => actorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, ct)
            : new Dictionary<string, User>();

        var entities = new List<Notification>(list.Count);
        foreach (var req in list)
        {
            entities.Add(Notification.Create(
                req.RecipientId,
                req.Type,
                req.Message,
                req.ActorId,
                req.TargetUrl));
        }

        dbContext.Notifications.AddRange(entities);
        await dbContext.SaveChangesAsync(ct);
        DevMeetTelemetry.NotificationsDeliveredTotal.Add(
            entities.Count,
            new TagList { { "channel", "db" }, { "outcome", "success" } });

        foreach (var entity in entities)
        {
            actors.TryGetValue(entity.ActorId ?? string.Empty, out var actor);
            var dto = new NotificationDto
            {
                Id = entity.Id,
                Type = entity.Type.ToString(),
                Message = entity.Message,
                TargetUrl = entity.TargetUrl,
                ActorUsername = actor?.UserName,
                ActorDisplayName = actor?.DisplayName,
                ActorImage = actor?.Picture,
                IsRead = entity.IsRead,
                CreatedAt = entity.CreatedAt
            };

            try
            {
                await sseBroker.PublishAsync(entity.RecipientId, dto, ct);
                DevMeetTelemetry.NotificationsDeliveredTotal.Add(
                    1,
                    new TagList { { "channel", "sse" }, { "outcome", "success" } });
            }
            catch
            {
                DevMeetTelemetry.NotificationsDeliveredTotal.Add(
                    1,
                    new TagList { { "channel", "sse" }, { "outcome", "failure" } });
            }
        }
    }
}
