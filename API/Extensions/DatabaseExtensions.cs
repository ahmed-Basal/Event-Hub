using API.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;

namespace API.Extensions;

/// <summary>
/// Service extensions for database options and Entity Framework Core persistence setup.
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Configures strongly-typed database options and registers Entity Framework DbContexts.
    /// </summary>
    public static IServiceCollection AddDatabaseServices(
        this IServiceCollection services,
        IConfiguration config)
    {
        // Bind and validate database options on application start
        services.AddOptions<DatabaseOptions>()
            .BindConfiguration(DatabaseOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // DbContext with PostgreSQL
        services.AddDbContext<DevMeetDbContext>((serviceProvider, options) =>
        {
            var dbOptions = serviceProvider.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            options.UseNpgsql(dbOptions.DefaultConnection);
        });

        // Abstract AppDbContext alias for decoupled access
        services.AddScoped<AppDbContext>(sp => (sp.GetRequiredService<DevMeetDbContext>() as AppDbContext)!);

        return services;
    }
}
