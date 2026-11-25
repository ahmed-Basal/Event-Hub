using Hangfire;

namespace DevMeet.Shared.Jobs;

/// <summary>
/// Implemented by modules that register recurring Hangfire jobs during application startup.
/// </summary>
public interface IRecurringJobRegistrar
{
    void RegisterJobs(IRecurringJobManager recurringJobManager);
}
