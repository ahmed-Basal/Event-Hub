using Asp.Versioning;

namespace API.Configuration;

/// <summary>
/// Configures Microsoft official API Versioning (Asp.Versioning) with URL segment,
/// HTTP header, and query string readers, as well as ApiExplorer integration.
/// </summary>
public static class VersioningConfiguration
{
    public static IServiceCollection AddVersioningConfiguration(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;

            // Supports multiple version discovery strategies simultaneously:
            // 1. URL path segment: /api/v1/activities
            // 2. HTTP header: X-Api-Version: 1.0
            // 3. Query string: ?api-version=1.0
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("X-Api-Version"),
                new QueryStringApiVersionReader("api-version")
            );
        })
        .AddMvc()
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        return services;
    }
}
