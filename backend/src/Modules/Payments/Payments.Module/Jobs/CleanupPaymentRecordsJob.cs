using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Payments.Module.Infrastructure;

namespace Payments.Module.Jobs;

[Queue("maintenance")]
[AutomaticRetry(Attempts = 2)]
public sealed class CleanupPaymentRecordsJob(
    PaymentsDbContext db,
    ILogger<CleanupPaymentRecordsJob> logger)
{
    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var webhookCutoff = now.AddDays(-90);

        var deletedIdempotency = await db.IdempotencyRecords
            .Where(r => r.ExpiresAtUtc < now)
            .ExecuteDeleteAsync(ct);

        var deletedWebhooks = await db.ProcessedWebhookEvents
            .Where(e => e.ProcessedAtUtc < webhookCutoff)
            .ExecuteDeleteAsync(ct);

        if (deletedIdempotency > 0 || deletedWebhooks > 0)
        {
            logger.LogInformation(
                "Cleaned up {IdempotencyCount} expired idempotency records and {WebhookCount} old processed webhook events.",
                deletedIdempotency,
                deletedWebhooks);
        }
    }
}
