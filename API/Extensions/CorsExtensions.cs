namespace API.Extensions;

/// <summary>
/// Extensions for Cross-Origin Resource Sharing (CORS) policy registration and middleware pipeline.
/// </summary>
public static class CorsExtensions
{
    public const string CorsPolicyName = "CorsPolicy";

    /// <summary>
    /// Configures Cross-Origin Resource Sharing (CORS) policy with configurable or fallback origins.
    /// </summary>
    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration config)
    {
        var configuredOrigins = config.GetSection("Cors:AllowedOrigins").Get<string[]>();

        var allowedOrigins = configuredOrigins is { Length: > 0 }
            ? configuredOrigins
            : [
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:3000",
                "https://localhost:3000"
            ];

        services.AddCors(opt =>
        {
            opt.AddPolicy(CorsPolicyName, policy =>
            {
                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithOrigins(allowedOrigins);
            });
        });

        return services;
    }

    /// <summary>
    /// Applies the application CORS policy to the HTTP request pipeline.
    /// </summary>
    public static IApplicationBuilder UseAppCors(this IApplicationBuilder app)
    {
        return app.UseCors(CorsPolicyName);
    }
}
