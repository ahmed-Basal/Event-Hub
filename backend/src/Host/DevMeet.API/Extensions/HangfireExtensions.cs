using System.Linq.Expressions;
using DevMeet.API.Options;
using DevMeet.Shared.Common;
using DevMeet.Shared.Jobs;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;

namespace DevMeet.API.Extensions;

public sealed class HangfireJobScheduler(IBackgroundJobClient client) : IBackgroundJobScheduler
{
    public string Enqueue<TJob>(Expression<Func<TJob, Task>> methodCall)
        => client.Enqueue(methodCall);

    public string Schedule<TJob>(Expression<Func<TJob, Task>> methodCall, TimeSpan delay)
        => client.Schedule(methodCall, delay);
}

public sealed class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        var env = httpContext.RequestServices.GetService<IHostEnvironment>();
        if (env?.IsDevelopment() == true)
            return true;

        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.IsInRole(AppRoles.Admin);
    }
}

public static class HangfireExtensions
{
    public static IServiceCollection AddAppHangfire(this IServiceCollection services, IConfiguration config)
    {
        services.AddOptions<HangfireOptions>()
            .BindConfiguration(HangfireOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var options = config.GetSection(HangfireOptions.SectionName).Get<HangfireOptions>() ?? new HangfireOptions();
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        if (!options.Enabled || string.IsNullOrWhiteSpace(connectionString))
        {
            services.AddSingleton<IBackgroundJobScheduler, NoOpBackgroundJobScheduler>();
            return services;
        }

        services.AddHangfire(cfg => cfg
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(
                pg => pg.UseNpgsqlConnection(connectionString),
                new PostgreSqlStorageOptions
                {
                    SchemaName = options.SchemaName,
                    PrepareSchemaIfNecessary = true
                }));

        services.AddHangfireServer(server =>
        {
            server.WorkerCount = options.WorkerCount;
            server.Queues = options.Queues;
        });

        services.AddScoped<IBackgroundJobScheduler, HangfireJobScheduler>();
        return services;
    }

    public static WebApplication UseAppHangfire(this WebApplication app)
    {
        var options = app.Configuration.GetSection(HangfireOptions.SectionName).Get<HangfireOptions>() ?? new HangfireOptions();
        var connectionString = app.Configuration.GetConnectionString("DefaultConnection")
            ?? app.Configuration.GetSection("ConnectionStrings:DefaultConnection").Value;

        if (!options.Enabled || string.IsNullOrWhiteSpace(connectionString))
            return app;

        app.UseHangfireDashboard(options.DashboardPath, new DashboardOptions
        {
            Authorization = [new HangfireDashboardAuthorizationFilter()],
            DashboardTitle = "DevMeet Background Jobs"
        });

        var recurringJobs = app.Services.GetRequiredService<IRecurringJobManager>();
        var registrars = app.Services.GetServices<IRecurringJobRegistrar>();
        foreach (var registrar in registrars)
        {
            registrar.RegisterJobs(recurringJobs);
        }

        return app;
    }
}
