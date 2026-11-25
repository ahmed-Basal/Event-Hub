using System.Data;
using Activities.Module.Infrastructure;
using Comments.Module.Infrastructure;
using DevMeet.Shared.Seeding;
using Identity.Module.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Notifications.Module.Infrastructure;
using Payments.Module.Infrastructure;
using Profiles.Module.Infrastructure;

namespace DevMeet.API.Extensions;

public static class SeedingExtensions
{
    public static async Task RunModuleSeedersAsync(this WebApplication app, CancellationToken ct = default)
    {
        var enabled = app.Configuration.GetValue<bool>("Seeding:Enabled", defaultValue: app.Environment.IsDevelopment());
        if (!enabled)
            return;

        var connectionString = app.Configuration.GetConnectionString("DefaultConnection")
            ?? app.Configuration.GetSection("ConnectionStrings:DefaultConnection").Value;

        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        await using var scope = app.Services.CreateAsyncScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("ModuleSeeding");

        DbContext[] contexts =
        [
            scope.ServiceProvider.GetRequiredService<IdentityDbContext>(),
            scope.ServiceProvider.GetRequiredService<ProfilesDbContext>(),
            scope.ServiceProvider.GetRequiredService<ActivitiesDbContext>(),
            scope.ServiceProvider.GetRequiredService<CommentsDbContext>(),
            scope.ServiceProvider.GetRequiredService<PaymentsDbContext>(),
            scope.ServiceProvider.GetRequiredService<NotificationsDbContext>()
        ];

        foreach (var ctx in contexts)
        {
            await EnsureModuleTablesExistAsync(ctx, logger, ct);
        }

        var seeders = scope.ServiceProvider.GetServices<IModuleSeeder>()
            .OrderBy(s => s.Order)
            .ToList();

        foreach (var seeder in seeders)
        {
            try
            {
                await seeder.SeedAsync(ct);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Module seeder {Seeder} failed during startup.", seeder.GetType().Name);
            }
        }
    }

    private static async Task EnsureModuleTablesExistAsync(
        DbContext ctx,
        ILogger logger,
        CancellationToken ct)
    {
        var firstTable = ctx.Model.GetEntityTypes()
            .Select(e => e.GetTableName())
            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t));

        if (string.IsNullOrWhiteSpace(firstTable))
            return;

        var conn = ctx.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open)
            await ctx.Database.OpenConnectionAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = @t)";
        var param = cmd.CreateParameter();
        param.ParameterName = "@t";
        param.Value = firstTable;
        cmd.Parameters.Add(param);

        var exists = Convert.ToBoolean(await cmd.ExecuteScalarAsync(ct));
        if (!exists)
        {
            await ctx.GetService<IRelationalDatabaseCreator>().CreateTablesAsync(ct);
            logger.LogInformation("Created schema tables for {DbContext}.", ctx.GetType().Name);
        }
    }
}
