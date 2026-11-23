using Application.Common.Events;
using Application.Interfaces;
using Domain;
using Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Comments.EventHandlers;

public sealed class CommentCreatedEventHandler(
    IAppDbContext dbContext,
    INotificationService notificationService,
    ILogger<CommentCreatedEventHandler> logger)
    : INotificationHandler<DomainEventNotification<CommentCreatedEvent>>
{
    public async Task Handle(
        DomainEventNotification<CommentCreatedEvent> notification,
        CancellationToken cancellationToken)
    {
        var e = notification.DomainEvent;
        try
        {
            var activity = await dbContext.Activities
                .AsNoTracking()
                .Where(a => a.Id == e.ActivityId)
                .Select(a => new
                {
                    a.Title,
                    RecipientIds = a.Attendees
                        .Where(att => att.UserId != null && att.UserId != e.AuthorUserId)
                        .Select(att => att.UserId!)
                        .Distinct()
                        .ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (activity is null || activity.RecipientIds.Count == 0) return;

            var authorName = await dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == e.AuthorUserId)
                .Select(u => u.DisplayName ?? u.UserName)
                .FirstOrDefaultAsync(cancellationToken) ?? "Someone";

            var preview = e.Body.Length > 60 ? $"{e.Body[..60]}..." : e.Body;
            var msg = $"{authorName} commented on \"{activity.Title}\": {preview}";
            var targetUrl = $"/activities/{e.ActivityId}";

            await notificationService.NotifyManyAsync(
                activity.RecipientIds.Select(rid => new NotificationRequest(
                    rid, e.AuthorUserId, NotificationType.NewComment, msg, targetUrl)),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to handle CommentCreatedEvent for Comment {CommentId}", e.CommentId);
        }
    }
}
