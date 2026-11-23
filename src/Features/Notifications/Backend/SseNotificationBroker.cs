using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Threading.Channels;
using Application.Feature.Notifications;
using Application.Interfaces;

namespace Infrastructure.Notifications;

/// <summary>
/// Thread-safe in-memory SSE pub/sub broker supporting multiple browser tabs per user
/// and short-lived single-use tickets for native EventSource authentication.
/// </summary>
public sealed class SseNotificationBroker : ISseNotificationBroker
{
    private sealed record SseTicket(string UserId, DateTimeOffset ExpiresAt);

    private static readonly TimeSpan TicketLifetime = TimeSpan.FromSeconds(30);

    private readonly ConcurrentDictionary<string, SseTicket> _tickets = new();
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, Channel<NotificationDto>>> _subscribers = new();

    public string CreateTicket(string userId)
    {
        PruneExpiredTickets();
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        _tickets[token] = new SseTicket(userId, DateTimeOffset.UtcNow.Add(TicketLifetime));
        return token;
    }

    public string? RedeemTicket(string ticket)
    {
        if (string.IsNullOrWhiteSpace(ticket))
        {
            return null;
        }

        if (!_tickets.TryRemove(ticket, out var entry))
        {
            return null;
        }

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
                {
                    yield return item;
                }
            }
        }
        finally
        {
            if (_subscribers.TryGetValue(userId, out var subs))
            {
                subs.TryRemove(subscriptionId, out _);
                if (subs.IsEmpty)
                {
                    _subscribers.TryRemove(userId, out _);
                }
            }
            channel.Writer.TryComplete();
        }
    }

    public ValueTask PublishAsync(
        string userId,
        NotificationDto notification,
        CancellationToken ct = default)
    {
        if (_subscribers.TryGetValue(userId, out var userSubs))
        {
            foreach (var channel in userSubs.Values)
            {
                channel.Writer.TryWrite(notification);
            }
        }

        return ValueTask.CompletedTask;
    }

    private void PruneExpiredTickets()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var kvp in _tickets)
        {
            if (kvp.Value.ExpiresAt < now)
            {
                _tickets.TryRemove(kvp.Key, out _);
            }
        }
    }
}
