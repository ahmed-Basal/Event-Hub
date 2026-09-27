using API.Options;
using Application.Activities.Commands;
using Application.Activities.Validators;
using Application.Core;
using AutoMapper;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Persistence;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        services.AddOpenApi();

        // Register AutoMapper
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MappingProfiles).Assembly));

        // Register MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(CreateActivity).Assembly);
            cfg.LicenseKey = config["MediatR:LicenseKey"];
        });

        // Register FluentValidation
        services.AddValidatorsFromAssemblyContaining<CreateActivityvalidator>();

        // Options Pattern: Bind and validate ConnectionStrings configuration
        services.AddOptions<DatabaseOptions>()
            .BindConfiguration(DatabaseOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // DbContext with PostgreSQL
        services.AddDbContext<DevMeetDbContext>((serviceProvider, options) =>
        {
            var dbOptions = serviceProvider.GetRequiredService<IOptions<DatabaseOptions>>().Value;
            options.UseNpgsql(dbOptions.DefaultConnection);
        });
        services.AddScoped<AppDbContext>(sp => (AppDbContext)sp.GetRequiredService<DevMeetDbContext>());

        // CORS Policy
        services.AddCors(opt =>
        {
            opt.AddPolicy("CorsPolicy", policy =>
            {
                policy.AllowAnyHeader().AllowAnyMethod().WithOrigins(
                    "http://localhost:5173",
                    "https://localhost:5173",
                    "http://localhost:3000",
                    "https://localhost:3000"
                );
            });
        });

        return services;
    }
}
