namespace API.Extensions;

/// <summary>
/// Root extension orchestrator that provides factory-based and default registration of application services.
/// </summary>
public static class ApplicationServiceExtensions
{
    /// <summary>
    /// Registers application services using the Fluent ApplicationServiceFactory.
    /// If no custom configure delegate is provided, all default services are registered automatically.
    /// </summary>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration config,
        Action<ApplicationServiceFactory>? configure = null)
    {
        var factory = new ApplicationServiceFactory(services, config);

        if (configure is not null)
        {
            configure(factory);
        }
        else
        {
            factory.WithAllDefaults();
        }

        return factory.Build();
    }

    /// <summary>
    /// Creates a fluent factory instance directly for custom registration pipelines.
    /// </summary>
    public static ApplicationServiceFactory CreateServiceFactory(
        this IServiceCollection services,
        IConfiguration config)
    {
        return new ApplicationServiceFactory(services, config);
    }
}



