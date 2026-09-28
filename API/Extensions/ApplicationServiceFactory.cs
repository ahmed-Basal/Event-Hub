namespace API.Extensions;

/// <summary>
/// Fluent Builder and Factory for configuring and registering modular application service layers.
/// Provides fine-grained control over which infrastructure subsystems (Database, CQRS, CORS, Mapping, OpenAPI) are activated.
/// </summary>
public sealed class ApplicationServiceFactory
{
    private readonly IServiceCollection _services;
    private readonly IConfiguration _config;

    public ApplicationServiceFactory(IServiceCollection services, IConfiguration config)
    {
        _services = services ?? throw new ArgumentNullException(nameof(services));
        _config = config ?? throw new ArgumentNullException(nameof(config));
    }

    /// <summary>
    /// Registers OpenAPI / Swagger documentation endpoints.
    /// </summary>
    public ApplicationServiceFactory WithOpenApi()
    {
        _services.AddOpenApi();
        return this;
    }

    /// <summary>
    /// Registers PostgreSQL DbContext, DatabaseOptions, and Persistence abstractions.
    /// </summary>
    public ApplicationServiceFactory WithDatabase()
    {
        _services.AddDatabaseServices(_config);
        return this;
    }

    /// <summary>
    /// Registers MediatR CQRS handlers, validation pipeline behaviors, and FluentValidation validators.
    /// </summary>
    public ApplicationServiceFactory WithCqrs()
    {
        _services.AddCqrsAndValidation(_config);
        return this;
    }

    /// <summary>
    /// Registers AutoMapper profile configurations across the Application assembly.
    /// </summary>
    public ApplicationServiceFactory WithMapping()
    {
        _services.AddMappingServices();
        return this;
    }

    /// <summary>
    /// Registers Cross-Origin Resource Sharing (CORS) policy.
    /// </summary>
    public ApplicationServiceFactory WithCors()
    {
        _services.AddCorsPolicy(_config);
        return this;
    }

    /// <summary>
    /// Convenience method to register all standard production services in recommended sequence.
    /// </summary>
    public ApplicationServiceFactory WithAllDefaults()
    {
        return this
            .WithOpenApi()
            .WithDatabase()
            .WithCqrs()
            .WithMapping()
            .WithCors();
    }

    /// <summary>
    /// Finalizes the factory configuration and returns the underlying IServiceCollection.
    /// </summary>
    public IServiceCollection Build() => _services;
}
