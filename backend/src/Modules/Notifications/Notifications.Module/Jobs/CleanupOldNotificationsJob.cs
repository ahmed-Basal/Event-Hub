using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Notifications.Module.Infrastructure;

namespace Notifications.Module.Jobs;

[Queue("maintenance")]
[AutomaticRetry(Attempts = 2)]
public sealed class CleanupOldNotificationsJob(
    NotificationsDbContext db,
    ILogger<CleanupOldNotificationsJob> logger)
{
    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-60);

        var deletedCount = await db.Notifications
            .Where(n => n.IsRead && n.CreatedAt < cutoff)
            .ExecuteDeleteAsync(ct);

        if (deletedCount > 0)
            logger.LogInformation("Cleaned up {Count} read notifications older than 60 days.", deletedCount);
    }
}
