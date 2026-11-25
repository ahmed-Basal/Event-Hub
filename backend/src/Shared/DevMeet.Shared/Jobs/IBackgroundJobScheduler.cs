using System.Linq.Expressions;
using Microsoft.Extensions.Logging;

namespace DevMeet.Shared.Jobs;

/// <summary>
/// Abstraction over background job scheduling so modules enqueue jobs without depending on Hangfire Server/Storage directly.
/// </summary>
public interface IBackgroundJobScheduler
{
    string Enqueue<TJob>(Expression<Func<TJob, Task>> methodCall);
    string Schedule<TJob>(Expression<Func<TJob, Task>> methodCall, TimeSpan delay);
}

/// <summary>
/// Safe fallback scheduler used when Hangfire is disabled (e.g. unit tests or missing database connection).
/// </summary>
public sealed class NoOpBackgroundJobScheduler(ILogger<NoOpBackgroundJobScheduler> logger) : IBackgroundJobScheduler
{
    public string Enqueue<TJob>(Expression<Func<TJob, Task>> methodCall)
    {
        logger.LogDebug("Hangfire disabled; skipping background enqueue for {JobType}.", typeof(TJob).Name);
        return string.Empty;
    }

    public string Schedule<TJob>(Expression<Func<TJob, Task>> methodCall, TimeSpan delay)
    {
        logger.LogDebug("Hangfire disabled; skipping scheduled background job for {JobType} (delay {Delay}).", typeof(TJob).Name, delay);
        return string.Empty;
    }
}
