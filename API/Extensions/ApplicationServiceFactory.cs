namespace API.Extensions;

public sealed class ApplicationServiceFactory
{
    private readonly IServiceCollection _services;
    private readonly IConfiguration _config;

    public ApplicationServiceFactory(IServiceCollection services, IConfiguration config)
    {
        _services = services ?? throw new ArgumentNullException(nameof(services));
        _config = config ?? throw new ArgumentNullException(nameof(config));
    }

    public ApplicationServiceFactory WithOpenApi()
    {
        _services.AddOpenApi();
        return this;
    }

    public ApplicationServiceFactory WithDatabase()
    {
        _services.AddDatabaseServices(_config);
        return this;
    }

    public ApplicationServiceFactory WithCqrs()
    {
        _services.AddCqrsAndValidation(_config);
        return this;
    }

    public ApplicationServiceFactory WithMapping()
    {
        _services.AddMappingServices();
        return this;
    }

    public ApplicationServiceFactory WithCors()
    {
        _services.AddCorsPolicy(_config);
        return this;
    }

    public ApplicationServiceFactory WithObservability()
    {
        _services.AddObservability(_config);
        return this;
    }

    public ApplicationServiceFactory WithIdentity()
    {
        _services.AddIdentityServices(_config);
        return this;
    }

    public ApplicationServiceFactory WithAllDefaults()
    {
        return this
            .WithOpenApi()
            .WithDatabase()
            .WithIdentity()
            .WithCqrs()
            .WithMapping()
            .WithCors()
            .WithObservability();
    }

    public IServiceCollection Build() => _services;
}
