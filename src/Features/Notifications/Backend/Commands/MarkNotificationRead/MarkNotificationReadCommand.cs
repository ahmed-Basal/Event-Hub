using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Notifications.Commands.MarkNotificationRead;

public class MarkNotificationReadCommand : IRequest<Response<string>>
{
    public required string Id { get; set; }
}

public class MarkNotificationReadCommandHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<MarkNotificationReadCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        MarkNotificationReadCommand request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();

        var notification = await dbContext.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.RecipientId == userId, cancellationToken);

        if (notification is null)
        {
            return NotFound<string>("Notification not found.");
        }

        if (!notification.IsRead)
        {
            notification.MarkAsRead();
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return Success(notification.Id);
    }
}
