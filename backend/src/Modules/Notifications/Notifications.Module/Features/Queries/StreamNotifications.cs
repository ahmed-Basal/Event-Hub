using System.Net.ServerSentEvents;
using System.Runtime.CompilerServices;
using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Features.Queries;

public sealed class StreamNotificationsRequest
{
    [QueryParam] public string Ticket { get; init; } = string.Empty;
}

public sealed class StreamNotificationsEndpoint(SseNotificationBroker broker)
    : Endpoint<StreamNotificationsRequest>
{
    private static readonly TimeSpan HeartbeatInterval = TimeSpan.FromSeconds(25);

    public override void Configure()
    {
        Get("/api/notifications/stream");
        AllowAnonymous();
    }

    public override async Task HandleAsync(StreamNotificationsRequest req, CancellationToken ct)
    {
        var userId = broker.RedeemTicket(req.Ticket);
        if (string.IsNullOrWhiteSpace(userId))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        HttpContext.Response.Headers.CacheControl = "no-cache";
        HttpContext.Response.Headers["X-Accel-Buffering"] = "no";

        await TypedResults.ServerSentEvents(StreamEventsAsync(userId, ct)).ExecuteAsync(HttpContext);
    }

    private async IAsyncEnumerable<SseItem<NotificationDto?>> StreamEventsAsync(
        string userId,
        [EnumeratorCancellation] CancellationToken ct)
    {
        yield return new SseItem<NotificationDto?>(null, eventType: "connected");

        await using var enumerator = broker.SubscribeAsync(userId, ct).GetAsyncEnumerator(ct);
        var moveNextTask = enumerator.MoveNextAsync().AsTask();

        while (!ct.IsCancellationRequested)
        {
            var heartbeatTask = Task.Delay(HeartbeatInterval, ct);
            Task completed;
            try
            {
                completed = await Task.WhenAny(moveNextTask, heartbeatTask);
            }
            catch (OperationCanceledException)
            {
                yield break;
            }

            if (completed == heartbeatTask)
            {
                if (ct.IsCancellationRequested) yield break;
                yield return new SseItem<NotificationDto?>(null, eventType: "ping");
                continue;
            }

            bool hasItem;
            try
            {
                hasItem = await moveNextTask;
            }
            catch (OperationCanceledException)
            {
                yield break;
            }

            if (!hasItem) yield break;

            yield return new SseItem<NotificationDto?>(enumerator.Current, eventType: "notification");
            moveNextTask = enumerator.MoveNextAsync().AsTask();
        }
    }
}
