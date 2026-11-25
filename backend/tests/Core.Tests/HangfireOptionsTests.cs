using DevMeet.API.Options;
using DevMeet.Shared.Jobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace Core.Tests;

public class HangfireOptionsTests
{
    private sealed class DummyJob
    {
        public Task ExecuteAsync() => Task.CompletedTask;
    }

    [Fact]
    public void HangfireOptions_Defaults_ShouldBeValid()
    {
        var options = new HangfireOptions();

        Assert.True(options.Enabled);
        Assert.Equal("/hangfire", options.DashboardPath);
        Assert.Equal("hangfire", options.SchemaName);
        Assert.True(options.WorkerCount >= 2);
        Assert.Equal(["critical", "default", "maintenance"], options.Queues);
    }

    [Fact]
    public void HangfireOptions_ShouldBindFromConfiguration()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [$"{HangfireOptions.SectionName}:Enabled"] = "false",
                [$"{HangfireOptions.SectionName}:DashboardPath"] = "/jobs",
                [$"{HangfireOptions.SectionName}:SchemaName"] = "jobs_schema",
                [$"{HangfireOptions.SectionName}:WorkerCount"] = "8"
            })
            .Build();

        var options = configuration.GetSection(HangfireOptions.SectionName).Get<HangfireOptions>();

        Assert.NotNull(options);
        Assert.False(options.Enabled);
        Assert.Equal("/jobs", options.DashboardPath);
        Assert.Equal("jobs_schema", options.SchemaName);
        Assert.Equal(8, options.WorkerCount);
    }

    [Fact]
    public void NoOpBackgroundJobScheduler_ShouldSafelyReturnEmptyJobId()
    {
        var scheduler = new NoOpBackgroundJobScheduler(NullLogger<NoOpBackgroundJobScheduler>.Instance);

        var enqueued = scheduler.Enqueue<DummyJob>(j => j.ExecuteAsync());
        var scheduled = scheduler.Schedule<DummyJob>(j => j.ExecuteAsync(), TimeSpan.FromMinutes(5));

        Assert.Equal(string.Empty, enqueued);
        Assert.Equal(string.Empty, scheduled);
    }
}
