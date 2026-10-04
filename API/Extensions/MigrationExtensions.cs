using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Extensions;

public static class MigrationExtensions
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        try
        {
            var context = services.GetRequiredService<DevMeetDbContext>();

            // Ensure __EFMigrationsHistory table exists
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                    ""MigrationId"" character varying(150) NOT NULL,
                    ""ProductVersion"" character varying(32) NOT NULL,
                    CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                );
            ");

            // If Activities table already exists in postgres, record InitialCreate so EF won't re-create it
            await context.Database.ExecuteSqlRawAsync(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Activities') THEN
                        IF NOT EXISTS (SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260930030356_InitialCreate') THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260930030356_InitialCreate', '9.0.9');
                        END IF;
                    END IF;
                END $$;
            ");

            // If Image column already exists on Activities, record AddImageAndDataProtection
            await context.Database.ExecuteSqlRawAsync(@"
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Activities' AND column_name = 'Image') THEN
                        IF NOT EXISTS (SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20261004203510_AddImageAndDataProtection') THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20261004203510_AddImageAndDataProtection', '9.0.9');
                        END IF;
                    END IF;
                END $$;
            ");

            await context.Database.MigrateAsync();
            await DbInitializer.SeedData(context);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred during migration/seeding");
        }
    }
}
