using System.Text.Json;
using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

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
        services.AddTransient<ExceptionMiddleware>();

        return services;
    }

    public static WebApplication UseExtraConfiguration(this WebApplication app)
    {
        app.MapPrometheusScrapingEndpoint();

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("live"),
            ResponseWriter = WriteSafeHealthResponse
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = WriteSafeHealthResponse
        });

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = WriteSafeHealthResponse
        });

        app.UseAppScalarDocumentation();
        app.UseAppCors();
        app.UseAppSecurity();

        return app;
    }

    private static Task WriteSafeHealthResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var payload = new
        {
            status = report.Status.ToString(),
            totalDurationMs = Math.Round(report.TotalDuration.TotalMilliseconds, 2),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                durationMs = Math.Round(e.Value.Duration.TotalMilliseconds, 2),
                description = e.Value.Description
            })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
