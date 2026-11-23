using System.Text.Json;
using System.Threading.Channels;
using Application.Common.Events;
using Domain.Common;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Outbox;

public interface IOutboxWakeup
{
    void Signal();
    ValueTask WaitAsync(TimeSpan timeout, CancellationToken ct);
}

public sealed class OutboxWakeup : IOutboxWakeup
{
    private readonly Channel<bool> _channel = Channel.CreateBounded<bool>(
        new BoundedChannelOptions(1) { FullMode = BoundedChannelFullMode.DropOldest });

    public void Signal() => _channel.Writer.TryWrite(true);

    public async ValueTask WaitAsync(TimeSpan timeout, CancellationToken ct)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(timeout);
        try
        {
            await _channel.Reader.ReadAsync(cts.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            // Periodic poll timeout elapsed; proceed to check pending/retryable messages.
        }
    }
}

public sealed class OutboxProcessor(
    IServiceScopeFactory scopeFactory,
    IOutboxWakeup wakeup,
    ILogger<OutboxProcessor> logger) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan StaleClaimTimeout = TimeSpan.FromMinutes(2);
    private readonly string _workerId = $"{Environment.MachineName}:{Guid.NewGuid():N}"[..Math.Min(64, Environment.MachineName.Length + 33)];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var processedCount = await ProcessBatchAsync(stoppingToken);
                if (processedCount == 20)
                {
                    continue; // Drain full batches immediately without waiting
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in OutboxProcessor loop");
            }

            await wakeup.WaitAsync(PollInterval, stoppingToken);
        }
    }

    public async Task<int> ProcessBatchAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DevMeetDbContext>();
        var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();

        var now = DateTimeOffset.UtcNow;
        var staleCutoff = now - StaleClaimTimeout;

        List<OutboxMessage> messages;
        if (dbContext.Database.IsNpgsql())
        {
            messages = await dbContext.OutboxMessages
                .FromSqlInterpolated($@"
                    UPDATE ""OutboxMessages""
                    SET ""ClaimedBy"" = {_workerId},
                        ""ClaimedAtUtc"" = {now}
                    WHERE ""Id"" IN (
                        SELECT ""Id""
                        FROM ""OutboxMessages""
                        WHERE ""Status"" = 'Pending'
                          AND (""NextRetryUtc"" IS NULL OR ""NextRetryUtc"" <= {now})
                          AND (""ClaimedAtUtc"" IS NULL OR ""ClaimedAtUtc"" < {staleCutoff})
                        ORDER BY ""OccurredOnUtc""
                        LIMIT 20
                        FOR UPDATE SKIP LOCKED
                    )
                    RETURNING *;")
                .ToListAsync(ct);
        }
        else
        {
            messages = await dbContext.OutboxMessages
                .Where(m => m.Status == OutboxStatus.Pending
                    && (m.NextRetryUtc == null || m.NextRetryUtc <= now)
                    && (m.ClaimedAtUtc == null || m.ClaimedAtUtc < staleCutoff))
                .OrderBy(m => m.OccurredOnUtc)
                .Take(20)
                .ToListAsync(ct);
        }

        if (messages.Count == 0) return 0;

        foreach (var msg in messages)
        {
            try
            {
                var eventType = OutboxMessage.ResolveEventType(msg.Type);
                if (eventType is null)
                {
                    msg.MarkRetryOrFailed($"Could not resolve domain event type '{msg.Type}'.", maxRetries: 1);
                    await dbContext.SaveChangesAsync(ct);
                    continue;
                }

                if (JsonSerializer.Deserialize(msg.Content, eventType) is not IDomainEvent domainEvent)
                {
                    msg.MarkRetryOrFailed($"Failed to deserialize domain event '{msg.Type}'.", maxRetries: 1);
                    await dbContext.SaveChangesAsync(ct);
                    continue;
                }

                var notificationType = typeof(DomainEventNotification<>).MakeGenericType(eventType);
                var notification = (INotification)Activator.CreateInstance(notificationType, domainEvent)!;

                await publisher.Publish(notification, ct);
                msg.MarkProcessed();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Failed processing OutboxMessage {OutboxMessageId} ({EventType}) on attempt {Attempt}",
                    msg.Id, msg.Type, msg.RetryCount + 1);
                msg.MarkRetryOrFailed(ex.Message);
            }

            await dbContext.SaveChangesAsync(ct);
        }

        return messages.Count;
    }
}
