using CorsOpts = DevMeet.API.Options.CorsOptions;

namespace DevMeet.API.Extensions;

public static class CorsExtensions
{
    public const string CorsPolicyName = "CorsPolicy";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddOptions<CorsOpts>()
            .BindConfiguration(CorsOpts.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddCors();
        services.AddOptions<Microsoft.AspNetCore.Cors.Infrastructure.CorsOptions>()
            .Configure<Microsoft.Extensions.Options.IOptions<CorsOpts>>((opt, myCorsOptions) =>
            {
                opt.AddPolicy(CorsPolicyName, policy =>
                {
                    policy
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithOrigins(myCorsOptions.Value.AllowedOrigins);
                });
            });

        return services;
    }

    public static IApplicationBuilder UseAppCors(this IApplicationBuilder app)
    {
        return app.UseCors(CorsPolicyName);
    }
}
