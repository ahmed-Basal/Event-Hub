using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Payments.Module.Domain;
using Payments.Module.Infrastructure;

namespace Payments.Module.Jobs;

[Queue("default")]
[AutomaticRetry(Attempts = 2)]
public sealed class ExpireStalePendingOrdersJob(
    PaymentsDbContext db,
    ILogger<ExpireStalePendingOrdersJob> logger)
{
    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var cutoff = DateTimeOffset.UtcNow.AddMinutes(-30);

        var staleOrders = await db.TicketOrders
            .Where(o => o.Status == PaymentStatus.Pending && o.CreatedAt < cutoff)
            .ToListAsync(ct);

        if (staleOrders.Count == 0) return;

        foreach (var order in staleOrders)
            order.MarkFailed();

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Marked {Count} stale pending ticket orders as Failed.", staleOrders.Count);
    }
}
