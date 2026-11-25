using DevMeet.Shared.Jobs;
using Hangfire;

namespace Activities.Module.Jobs;

public sealed class ActivitiesRecurringJobRegistrar : IRecurringJobRegistrar
{
    public void RegisterJobs(IRecurringJobManager recurringJobManager)
    {
        recurringJobManager.AddOrUpdate<SendUpcomingActivityRemindersJob>(
            recurringJobId: "activities-upcoming-reminders",
            methodCall: job => job.ExecuteAsync(CancellationToken.None),
            cronExpression: "0 * * * *");
    }
}
