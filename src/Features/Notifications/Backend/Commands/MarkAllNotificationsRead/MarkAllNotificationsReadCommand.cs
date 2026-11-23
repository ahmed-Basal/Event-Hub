using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Notifications.Commands.MarkAllNotificationsRead;

public class MarkAllNotificationsReadCommand : IRequest<Response<int>>
{
}

public class MarkAllNotificationsReadCommandHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<MarkAllNotificationsReadCommand, Response<int>>
{
    public async Task<Response<int>> Handle(
        MarkAllNotificationsReadCommand request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();

        var unread = await dbContext.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var n in unread)
        {
            n.MarkAsRead();
        }

        if (unread.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return Success(unread.Count);
    }
}
