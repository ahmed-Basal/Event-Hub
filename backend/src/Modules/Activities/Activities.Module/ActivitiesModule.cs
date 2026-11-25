using Activities.Contracts;
using Activities.Module.Domain;
using Activities.Module.Features.Events;
using Activities.Module.Infrastructure;
using Activities.Module.Jobs;
using DevMeet.Shared.Events;
using DevMeet.Shared.Jobs;
using DevMeet.Shared.Seeding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Activities.Module;

public static class ActivitiesModule
{
    public static IServiceCollection AddActivitiesModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<ActivitiesDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddScoped<IActivitiesDirectory, ActivitiesDirectory>();
        services.AddScoped<IDomainEventHandler<ActivityAttendeeJoinedEvent>, ActivityDomainEventHandlers>();
        services.AddScoped<IDomainEventHandler<ActivityAttendeeLeftEvent>, ActivityDomainEventHandlers>();
        services.AddScoped<IDomainEventHandler<ActivityCancelledEvent>, ActivityDomainEventHandlers>();
        services.AddScoped<IDomainEventHandler<ActivityReactivatedEvent>, ActivityDomainEventHandlers>();
        services.AddScoped<IDomainEventHandler<ActivityDetailsUpdatedEvent>, ActivityDomainEventHandlers>();
        services.AddScoped<IDomainEventHandler<WaitlistUserPromotedEvent>, ActivityDomainEventHandlers>();
        services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

        services.AddAuthorizationBuilder()
            .AddPolicy(IsHostRequirement.PolicyName, policy =>
                policy.Requirements.Add(new IsHostRequirement()));

        services.AddScoped<SendUpcomingActivityRemindersJob>();
        services.AddSingleton<IRecurringJobRegistrar, ActivitiesRecurringJobRegistrar>();
        services.AddScoped<IModuleSeeder, ActivitiesSeeder>();

        return services;
    }
}
