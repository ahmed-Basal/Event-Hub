using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Threading.Channels;
using Identity.Contracts;
using Notifications.Contracts;
using Notifications.Module.Domain;

namespace Notifications.Module.Infrastructure;

public sealed record NotificationDto(
    string Id,
    string Type,
    string Message,
    string? TargetUrl,
    bool IsRead,
    DateTimeOffset CreatedAt,
    string? ActorUsername,
    string? ActorDisplayName,
    string? ActorImage);

public sealed class SseNotificationBroker
{
    private sealed record SseTicket(string UserId, DateTimeOffset ExpiresAt);
    private static readonly TimeSpan TicketLifetime = TimeSpan.FromSeconds(30);
    private readonly ConcurrentDictionary<string, SseTicket> _tickets = new();
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, Channel<NotificationDto>>> _subscribers = new();

    public string CreateTicket(string userId)
    {
        foreach (var kvp in _tickets)
        {
            if (kvp.Value.ExpiresAt < DateTimeOffset.UtcNow)
                _tickets.TryRemove(kvp.Key, out _);
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        _tickets[token] = new SseTicket(userId, DateTimeOffset.UtcNow.Add(TicketLifetime));
        return token;
    }

    public string? RedeemTicket(string ticket)
    {
        if (string.IsNullOrWhiteSpace(ticket) || !_tickets.TryRemove(ticket, out var entry))
            return null;

        return entry.ExpiresAt >= DateTimeOffset.UtcNow ? entry.UserId : null;
    }

    public async IAsyncEnumerable<NotificationDto> SubscribeAsync(
        string userId,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var subscriptionId = Guid.NewGuid();
        var channel = Channel.CreateBounded<NotificationDto>(new BoundedChannelOptions(64)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        });

        var userSubs = _subscribers.GetOrAdd(userId, _ => new ConcurrentDictionary<Guid, Channel<NotificationDto>>());
        userSubs[subscriptionId] = channel;

        try
        {
            while (await channel.Reader.WaitToReadAsync(ct))
            {
                while (channel.Reader.TryRead(out var item))
                    yield return item;
            }
        }
        finally
        {
            if (_subscribers.TryGetValue(userId, out var subs))
            {
                subs.TryRemove(subscriptionId, out _);
                if (subs.IsEmpty) _subscribers.TryRemove(userId, out _);
            }
            channel.Writer.TryComplete();
        }
    }

    public ValueTask PublishAsync(string userId, NotificationDto notification, CancellationToken ct = default)
    {
        if (_subscribers.TryGetValue(userId, out var userSubs))
        {
            foreach (var channel in userSubs.Values)
                channel.Writer.TryWrite(notification);
        }
        return ValueTask.CompletedTask;
    }
}

public sealed class NotificationPublisher(
    NotificationsDbContext db,
    SseNotificationBroker broker,
    IIdentityDirectory identity) : INotificationPublisher
{
    public Task SendAsync(
        string recipientId,
        NotificationType type,
        string message,
        string? actorId = null,
        string? targetUrl = null,
        CancellationToken ct = default)
        => SendToManyAsync([recipientId], type, message, actorId, targetUrl, ct);

    public async Task SendToManyAsync(
        IEnumerable<string> recipientIds,
        NotificationType type,
        string message,
        string? actorId = null,
        string? targetUrl = null,
        CancellationToken ct = default)
    {
        var distinct = recipientIds.Where(id => !string.IsNullOrWhiteSpace(id) && id != actorId).Distinct().ToList();
        if (distinct.Count == 0) return;

        var actor = string.IsNullOrWhiteSpace(actorId) ? null : await identity.GetByIdAsync(actorId, ct);

        var entities = distinct.Select(rid => Notification.Create(rid, type, message, actorId, targetUrl)).ToList();
        db.Notifications.AddRange(entities);
        await db.SaveChangesAsync(ct);

        foreach (var entity in entities)
        {
            var dto = new NotificationDto(
                entity.Id,
                entity.Type.ToString(),
                entity.Message,
                entity.TargetUrl,
                entity.IsRead,
                entity.CreatedAt,
                actor?.UserName,
                actor?.DisplayName,
                actor?.Picture);

            await broker.PublishAsync(entity.RecipientId, dto, ct);
        }
    }
}
