using Core.Application.Behaviors;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Core;

public static class ModuleCoreDi
{
    public static IServiceCollection AddCoreDi(
        this IServiceCollection services,
        IConfiguration? config = null)
    {
        var coreAssembly = typeof(ModuleCoreDi).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(coreAssembly);
            cfg.AddOpenBehavior(typeof(TracingBehavior<,>));
            cfg.AddOpenBehavior(typeof(MetricsBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));

            var licenseKey = config?.GetSection("MediatR:LicenseKey").Value;
            if (!string.IsNullOrEmpty(licenseKey))
            {
                cfg.LicenseKey = licenseKey;
            }
        });

        services.AddValidatorsFromAssembly(coreAssembly);
        services.AddAutoMapper(cfg => cfg.AddMaps(coreAssembly));

        return services;
    }
}
