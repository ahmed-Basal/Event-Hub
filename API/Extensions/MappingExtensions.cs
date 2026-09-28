using Application.Core;

namespace API.Extensions;

/// <summary>
/// Service extensions for AutoMapper profile registration.
/// </summary>
public static class MappingExtensions
{
    /// <summary>
    /// Registers AutoMapper profiles from the Application layer.
    /// </summary>
    public static IServiceCollection AddMappingServices(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MappingProfiles).Assembly));
        return services;
    }
}
