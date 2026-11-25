using DevMeet.Shared.Jobs;
using Hangfire;

namespace Payments.Module.Jobs;

public sealed class PaymentsRecurringJobRegistrar : IRecurringJobRegistrar
{
    public void RegisterJobs(IRecurringJobManager recurringJobManager)
    {
        recurringJobManager.AddOrUpdate<ExpireStalePendingOrdersJob>(
            recurringJobId: "payments-expire-stale-orders",
            methodCall: job => job.ExecuteAsync(CancellationToken.None),
            cronExpression: "*/15 * * * *");

        recurringJobManager.AddOrUpdate<CleanupPaymentRecordsJob>(
            recurringJobId: "payments-cleanup-records",
            methodCall: job => job.ExecuteAsync(CancellationToken.None),
            cronExpression: "0 */6 * * *");
    }
}
