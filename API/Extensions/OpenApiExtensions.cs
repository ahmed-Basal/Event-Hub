using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

namespace API.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddAppOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi("v1", options =>
        {
            options.AddDocumentTransformer((document, context, cancellationToken) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "DevMeet Egypt API",
                    Version = "v1",
                    Description = "REST API for DevMeet Egypt - Tech Events & Meetups Platform.",
                    Contact = new OpenApiContact
                    {
                        Name = "DevMeet Egypt Team",
                        Email = "ahmedbassl913@devmeet.com",
                        Url = new Uri("https://github.com/ahmed-Basal/Event-Hub")
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
