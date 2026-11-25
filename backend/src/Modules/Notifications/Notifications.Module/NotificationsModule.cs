using DevMeet.Shared.Jobs;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Notifications.Contracts;
using Notifications.Module.Infrastructure;
using Notifications.Module.Jobs;

namespace Notifications.Module;

public static class NotificationsModule
{
    public static IServiceCollection AddNotificationsModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<NotificationsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddSingleton<SseNotificationBroker>();
        services.AddScoped<INotificationPublisher, NotificationPublisher>();
        services.AddScoped<CleanupOldNotificationsJob>();
        services.AddSingleton<IRecurringJobRegistrar, NotificationsRecurringJobRegistrar>();
        services.AddScoped<IModuleSeeder, NotificationsSeeder>();

        return services;
    }
}
