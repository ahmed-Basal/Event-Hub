using Application.Core;

namespace API.Extensions;

public static class MappingExtensions
{

    public static IServiceCollection AddMappingServices(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MappingProfiles).Assembly));
        return services;
    }
}
