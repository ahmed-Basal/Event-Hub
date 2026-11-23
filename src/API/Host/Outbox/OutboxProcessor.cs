using System.Diagnostics;
using System.Text.Json;
using System.Threading.Channels;
using Application.Common.Events;
using Application.Observability;
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
        var sw = Stopwatch.StartNew();
        using var batchActivity = DevMeetTelemetry.ActivitySource.StartActivity("Outbox: ProcessBatch", ActivityKind.Internal);

        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DevMeetDbContext>();
        var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();

        var now = DateTimeOffset.UtcNow;
        var staleCutoff = now - StaleClaimTimeout;

        var pendingCount = await dbContext.OutboxMessages
            .AsNoTracking()
            .CountAsync(m => m.Status == OutboxStatus.Pending, ct);
        DevMeetTelemetry.SetOutboxPendingCount(pendingCount);

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

        batchActivity?.SetTag("outbox.batch_size", messages.Count);
        if (messages.Count == 0)
        {
            return 0;
        }

        foreach (var msg in messages)
        {
            var eventShortName = msg.Type.Split(',')[0].Split('.').LastOrDefault() ?? "Unknown";
            using var msgActivity = DevMeetTelemetry.ActivitySource.StartActivity("Outbox: DispatchEvent", ActivityKind.Internal);
            msgActivity?.SetTag("outbox.event_type", eventShortName);
            msgActivity?.SetTag("outbox.attempt", msg.RetryCount + 1);

            try
            {
                var eventType = OutboxMessage.ResolveEventType(msg.Type);
                if (eventType is null)
                {
                    msg.MarkRetryOrFailed($"Could not resolve domain event type '{msg.Type}'.", maxRetries: 1);
                    DevMeetTelemetry.OutboxProcessedTotal.Add(1, new KeyValuePair<string, object?>("outcome", "failed"));
                    msgActivity?.SetStatus(ActivityStatusCode.Error, "Unresolvable event type");
                    await dbContext.SaveChangesAsync(ct);
                    continue;
                }

                if (JsonSerializer.Deserialize(msg.Content, eventType) is not IDomainEvent domainEvent)
                {
                    msg.MarkRetryOrFailed($"Failed to deserialize domain event '{msg.Type}'.", maxRetries: 1);
                    DevMeetTelemetry.OutboxProcessedTotal.Add(1, new KeyValuePair<string, object?>("outcome", "failed"));
                    msgActivity?.SetStatus(ActivityStatusCode.Error, "Deserialization failed");
                    await dbContext.SaveChangesAsync(ct);
                    continue;
                }

                var notificationType = typeof(DomainEventNotification<>).MakeGenericType(eventType);
                var notification = (INotification)Activator.CreateInstance(notificationType, domainEvent)!;

                await publisher.Publish(notification, ct);
                msg.MarkProcessed();
                msgActivity?.SetStatus(ActivityStatusCode.Ok);
                DevMeetTelemetry.OutboxProcessedTotal.Add(1, new KeyValuePair<string, object?>("outcome", "processed"));
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex,
                    "Failed processing OutboxMessage {OutboxMessageId} ({EventType}) on attempt {Attempt}",
                    msg.Id, eventShortName, msg.RetryCount + 1);
                msg.MarkRetryOrFailed(ex.Message);
                DevMeetTelemetry.RecordException(msgActivity, ex);
                var outcome = msg.Status == OutboxStatus.Failed ? "failed" : "retry";
                DevMeetTelemetry.OutboxProcessedTotal.Add(1, new KeyValuePair<string, object?>("outcome", outcome));
            }

            await dbContext.SaveChangesAsync(ct);
        }

        sw.Stop();
        DevMeetTelemetry.OutboxBatchDurationMs.Record(sw.Elapsed.TotalMilliseconds);
        var remaining = await dbContext.OutboxMessages
            .AsNoTracking()
            .CountAsync(m => m.Status == OutboxStatus.Pending, ct);
        DevMeetTelemetry.SetOutboxPendingCount(remaining);

        return messages.Count;
    }
}
