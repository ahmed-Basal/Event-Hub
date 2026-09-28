using Application.Activities.Commands;
using Application.Core;
using FluentValidation;

namespace API.Extensions;

/// <summary>
/// Service extensions for CQRS pattern (MediatR), Pipeline Behaviors, and FluentValidation.
/// </summary>
public static class CqrsExtensions
{
    /// <summary>
    /// Configures MediatR handlers, validation pipeline behavior, and assembly-wide FluentValidation validators.
    /// </summary>
    public static IServiceCollection AddCqrsAndValidation(
        this IServiceCollection services,
        IConfiguration config)
    {
        var applicationAssembly = typeof(CreateActivity).Assembly;

        // Register MediatR handlers and validation pipeline behavior
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(applicationAssembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.LicenseKey = config["MediatR:LicenseKey"];
        });

        // Register all FluentValidation validators from the Application assembly
        services.AddValidatorsFromAssembly(applicationAssembly);

        return services;
    }
}
