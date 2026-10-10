using API.Options;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace API.Extensions;

/// <summary>
/// Provides extension methods for configuring OpenAPI specifications and Scalar interactive API documentation.
/// </summary>
public static class OpenApiExtensions
{
    /// <summary>
    /// Registers OpenAPI document generation services with DevMeet platform metadata and JWT Bearer security schemes.
    /// </summary>
    /// <param name="services">The application service collection.</param>
    /// <param name="config">The configuration instance to resolve ApiSettings from.</param>
    /// <returns>The configured service collection for chaining.</returns>
    public static IServiceCollection AddAppOpenApi(this IServiceCollection services, IConfiguration? config = null)
    {
        var apiSettings = config?.GetSection(ApiSettings.SectionName).Get<ApiSettings>() ?? new ApiSettings();

        services.AddOpenApi(apiSettings.Version, options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = apiSettings.Title,
                    Version = apiSettings.Version,
                    Description = apiSettings.Description,
                    Contact = new OpenApiContact
                    {
                        Name = apiSettings.ContactName,
                        Email = apiSettings.ContactEmail,
                        Url = !string.IsNullOrWhiteSpace(apiSettings.ContactUrl) ? new Uri(apiSettings.ContactUrl) : null
                    }
                };

                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Enter JWT Bearer token as: `Bearer {your-token}`",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                };

                document.Components ??= new OpenApiComponents();
                if (document.Components.SecuritySchemes != null)
                {
                    document.Components.SecuritySchemes["Bearer"] = securityScheme;
                }

                return Task.CompletedTask;
            });
        });

        return services;
    }

    /// <summary>
    /// Mounts the interactive Scalar API Reference UI and developer shortcuts in development mode.
    /// </summary>
    /// <param name="app">The web application host.</param>
    /// <returns>The web application instance for chaining.</returns>
    public static WebApplication UseAppScalarDocumentation(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();

            app.MapScalarApiReference(options =>
            {
                options.WithTitle("DevMeet Egypt - API Reference")
                       .WithTheme(ScalarTheme.Moon)
                       .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
            });

            // Convenient developer redirects
            app.MapGet("/", () => Results.Redirect("/scalar/v1"));
            app.MapGet("/swagger", () => Results.Redirect("/scalar/v1"));
            app.MapGet("/docs", () => Results.Redirect("/scalar/v1"));
        }

        return app;
    }
}
