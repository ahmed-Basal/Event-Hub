namespace API.Extensions;

public static class ApplicationServiceExtensions
{

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

    public static ApplicationServiceFactory CreateServiceFactory(
        this IServiceCollection services,
        IConfiguration config)
    {
        return new ApplicationServiceFactory(services, config);
    }
}

