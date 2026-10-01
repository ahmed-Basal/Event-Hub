using API.Options;
using Application.Activities.Commands;
using Application.Core;
using FluentValidation;

namespace API.Extensions;

public static class CqrsExtensions
{
    public static IServiceCollection AddCqrsAndValidation(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddOptions<MediatorOptions>()
            .BindConfiguration(MediatorOptions.SectionName);

        var mediatorOptions = config.GetSection(MediatorOptions.SectionName).Get<MediatorOptions>();
        var applicationAssembly = typeof(CreateActivity).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(applicationAssembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(TracingBehavior<,>));
            cfg.AddOpenBehavior(typeof(MetricsBehavior<,>));
            cfg.LicenseKey = mediatorOptions?.LicenseKey;
        });

        services.AddValidatorsFromAssembly(applicationAssembly);

        return services;
    }
}
