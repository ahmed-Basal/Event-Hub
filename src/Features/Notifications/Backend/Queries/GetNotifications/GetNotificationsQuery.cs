using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Notifications.Queries.GetNotifications;

public class GetNotificationsQuery : IRequest<Response<NotificationsEnvelopeDto>>
{
    public int Take { get; set; } = 30;
}

public class GetNotificationsQueryHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetNotificationsQuery, Response<NotificationsEnvelopeDto>>
{
    public async Task<Response<NotificationsEnvelopeDto>> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();
        var take = Math.Clamp(request.Take, 1, 100);

        var unreadCount = await dbContext.Notifications
            .AsNoTracking()
            .CountAsync(n => n.RecipientId == userId && !n.IsRead, cancellationToken);

        var items = await dbContext.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(take)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                Message = n.Message,
                TargetUrl = n.TargetUrl,
                ActorUsername = n.Actor != null ? n.Actor.UserName : null,
                ActorDisplayName = n.Actor != null ? n.Actor.DisplayName : null,
                ActorImage = n.Actor != null ? n.Actor.Picture : null,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Success(new NotificationsEnvelopeDto
        {
            UnreadCount = unreadCount,
            Items = items
        });
    }
}
