using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using Application.Feature.Notifications;
using Application.Feature.Notifications.Commands.MarkAllNotificationsRead;
using Application.Feature.Notifications.Commands.MarkNotificationRead;
using Application.Feature.Notifications.Queries.GetNotifications;
using Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class NotificationsController(
    ISender mediator,
    ISseNotificationBroker sseBroker,
    IUserAccessor userAccessor) : BaseApiController
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult> GetNotifications([FromQuery] int take = 30, CancellationToken ct = default)
    {
        return NewResult(await mediator.Send(new GetNotificationsQuery { Take = take }, ct));
    }

    [Authorize]
    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkRead(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new MarkNotificationReadCommand { Id = id }, ct));
    }

    [Authorize]
    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllRead(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new MarkAllNotificationsReadCommand(), ct));
    }

    /// <summary>
    /// Issues a short-lived (30s) single-use ticket for establishing a native browser EventSource SSE stream
    /// without exposing the JWT in query strings or access logs.
    /// </summary>
    [Authorize]
    [HttpPost("ticket")]
    public ActionResult CreateSseTicket()
    {
        var userId = userAccessor.GetUserId();
        var ticket = sseBroker.CreateTicket(userId);
        return Ok(new { ticket });
    }

    /// <summary>
    /// Streams live notifications over Server-Sent Events (text/event-stream) using a redeemed single-use ticket.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("stream")]
    public IResult Stream([FromQuery] string ticket, CancellationToken ct)
    {
        var userId = sseBroker.RedeemTicket(ticket);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return TypedResults.Unauthorized();
        }

        Response.Headers.CacheControl = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        return TypedResults.ServerSentEvents(StreamEventsAsync(userId, ct));
    }

    private async IAsyncEnumerable<SseItem<NotificationDto?>> StreamEventsAsync(
        string userId,
        [EnumeratorCancellation] CancellationToken ct)
    {
        // Send initial connected heartbeat so client immediately knows the stream is live
        yield return new SseItem<NotificationDto?>(null, eventType: "connected");

        await using var enumerator = sseBroker.SubscribeAsync(userId, ct).GetAsyncEnumerator(ct);
        while (true)
        {
            bool hasNext;
            try
            {
                hasNext = await enumerator.MoveNextAsync();
            }
            catch (OperationCanceledException)
            {
                yield break;
            }

            if (!hasNext) yield break;

            var notification = enumerator.Current;
            yield return new SseItem<NotificationDto?>(notification, eventType: "notification")
            {
                EventId = notification.Id
            };
        }
    }
}
