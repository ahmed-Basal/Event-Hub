using DevMeet.Shared.Jobs;
using Hangfire;

namespace Notifications.Module.Jobs;

public sealed class NotificationsRecurringJobRegistrar : IRecurringJobRegistrar
{
    public void RegisterJobs(IRecurringJobManager recurringJobManager)
    {
        recurringJobManager.AddOrUpdate<CleanupOldNotificationsJob>(
            recurringJobId: "notifications-cleanup-old-read",
            methodCall: job => job.ExecuteAsync(CancellationToken.None),
            cronExpression: "0 4 * * *");
    }
}
