using FastEndpoints;
using Identity.Contracts;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Features.Commands;

public sealed class CreateSseTicketEndpoint(SseNotificationBroker broker, ICurrentUser currentUser)
    : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/api/notifications/ticket");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var ticket = broker.CreateTicket(currentUser.UserId);
        await Send.OkAsync(new { ticket }, ct);
    }
}
