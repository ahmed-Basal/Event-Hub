using DevMeet.Shared.Events;
using DevMeet.Shared.Jobs;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Payments.Contracts;
using Payments.Module.Domain;
using Payments.Module.Features.Events;
using Payments.Module.Infrastructure;
using Payments.Module.Jobs;

namespace Payments.Module;

public static class PaymentsModule
{
    public static IServiceCollection AddPaymentsModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<PaymentsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddOptions<StripeSettings>().BindConfiguration(StripeSettings.SectionName);
        services.AddScoped<IPaymentService, StripePaymentService>();
        services.AddScoped<IPaymentsDirectory, PaymentsDirectory>();
        services.AddScoped<IDomainEventHandler<TicketOrderPaidEvent>, TicketOrderPaidEventHandler>();

        services.AddScoped<ExpireStalePendingOrdersJob>();
        services.AddScoped<CleanupPaymentRecordsJob>();
        services.AddSingleton<IRecurringJobRegistrar, PaymentsRecurringJobRegistrar>();
        services.AddScoped<IModuleSeeder, PaymentsSeeder>();

        return services;
    }
}
