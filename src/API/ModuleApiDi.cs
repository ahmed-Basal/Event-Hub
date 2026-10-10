using API.Configuration;

namespace API;

public static class ModuleApiDi
{
    public static IServiceCollection AddApiDi(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddApiConfigurations(config);

        return services;
    }
}
