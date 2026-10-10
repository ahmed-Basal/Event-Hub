using API.Extensions;
using API.Middleware;

namespace API;

public static class ModuleApiDi
{
    public static IServiceCollection AddApiDi(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddControllers();
        services.AddAppOpenApi();
        services.AddIdentityServices(config);
        services.AddCorsPolicy(config);
        services.AddAppSecurityServices(config);
        services.AddObservability(config);
        services.AddTransient<ExceptionMiddleware>();

        return services;
    }
}
