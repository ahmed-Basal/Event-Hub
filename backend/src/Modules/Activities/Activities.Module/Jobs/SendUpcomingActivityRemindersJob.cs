using Activities.Module.Infrastructure;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Notifications.Contracts;

namespace Activities.Module.Jobs;

[Queue("default")]
[AutomaticRetry(Attempts = 2)]
public sealed class SendUpcomingActivityRemindersJob(
    ActivitiesDbContext db,
    INotificationPublisher notifications,
    ILogger<SendUpcomingActivityRemindersJob> logger)
{
    public async Task ExecuteAsync(CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var windowEnd = now.AddHours(24);

        var upcomingActivities = await db.Activities
            .Include(a => a.Attendees)
            .Where(a => !a.IsCancelled && a.ReminderSentAtUtc == null && a.Date > now && a.Date <= windowEnd)
            .ToListAsync(ct);

        if (upcomingActivities.Count == 0) return;

        foreach (var activity in upcomingActivities)
        {
            var recipientIds = activity.Attendees
                .Select(att => att.UserId)
                .Distinct()
                .ToList();

            if (recipientIds.Count > 0)
            {
                await notifications.SendToManyAsync(
                    recipientIds,
                    NotificationType.ActivityReminder,
                    $"Reminder: '{activity.Title}' starts in less than 24 hours at {activity.Venue}, {activity.City}.",
                    targetUrl: $"/activities/{activity.Id}",
                    ct: ct);
            }

            activity.MarkReminderSent();
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Sent idempotent upcoming activity reminders for {Count} activities.", upcomingActivities.Count);
    }
}
