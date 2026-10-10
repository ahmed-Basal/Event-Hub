using Application.Behaviors;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ModuleApplicationDi
{
    public static IServiceCollection AddApplicationDi(
        this IServiceCollection services,
        IConfiguration? config = null)
    {
        var applicationAssembly = typeof(ModuleApplicationDi).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(applicationAssembly);
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

        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddAutoMapper(cfg => cfg.AddMaps(applicationAssembly));

        return services;
    }
}
