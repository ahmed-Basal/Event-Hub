using API.Options;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace API.Configuration;

/// <summary>
/// Provides unified high-level composition extension methods for all API layer configurations.
/// </summary>
public static class ApiConfigurationExtensions
{
    /// <summary>
    /// Registers all API configurations: ApiSettings options, Core conventions, Versioning, and Extra/External integrations.
    /// </summary>
    public static IServiceCollection AddApiConfigurations(
        this IServiceCollection services,
        IConfiguration config)
    {
        // 1. Strongly-typed ApiSettings options binding & validation
        services.AddOptions<ApiSettings>()
            .BindConfiguration(ApiSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // 2. Core framework configurations (Routing, Controllers, JSON, ProblemDetails)
        services.AddCoreApiConfiguration();

        // 3. API Versioning configuration (Asp.Versioning)
        services.AddVersioningConfiguration();

        // 4. Extra & Cross-cutting infrastructure services
        services.AddExtraConfiguration(config);

        return services;
    }

    /// <summary>
    /// Mounts all API pipeline middleware and endpoints (Scalar Docs, CORS, Security headers, Metrics, Health).
    /// </summary>
    public static WebApplication UseApiConfigurations(this WebApplication app)
    {
        app.UseExtraConfiguration();
        return app;
    }
}
