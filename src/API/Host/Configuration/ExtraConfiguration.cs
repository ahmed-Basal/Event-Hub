using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace API.Configuration;

/// <summary>
/// Configures third-party, external, and cross-cutting platform concerns including
/// security headers, CORS, telemetry, OpenAPI/Scalar documentation, and health check probes.
/// </summary>
public static class ExtraConfiguration
{
    public static IServiceCollection AddExtraConfiguration(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddIdentityServices(config);
        services.AddCorsPolicy(config);
        services.AddAppSecurityServices(config);
        services.AddObservability(config);
        services.AddAppOpenApi(config);
        services.AddHealthChecks();
        services.AddTransient<ExceptionMiddleware>();

        return services;
    }

    public static WebApplication UseExtraConfiguration(this WebApplication app)
    {
        app.MapPrometheusScrapingEndpoint();
        app.MapHealthChecks("/health");

        app.UseAppScalarDocumentation();
        app.UseAppCors();
        app.UseAppSecurity();

        return app;
    }
}
