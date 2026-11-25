using DevMeet.Shared.Seeding;
using Identity.Contracts;
using Identity.Module.Infrastructure;
using Identity.Module.Jobs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Module;

public static class IdentityModule
{
    public const string KeycloakScheme = "Keycloak";

    public static IServiceCollection AddIdentityModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddDataProtection().PersistKeysToDbContext<IdentityDbContext>();

        services.AddOptions<KeycloakOptions>().BindConfiguration(KeycloakOptions.SectionName);
        services.AddOptions<ResendSettings>().BindConfiguration(ResendSettings.SectionName);

        var keycloakSection = config.GetSection(KeycloakOptions.SectionName);
        var keycloakAuthority = keycloakSection.GetValue<string>("Authority") ?? "http://localhost:8082/realms/reactivities";
        var keycloakAudience = keycloakSection.GetValue<string>("Audience") ?? "reactivities-api";
        var keycloakRequireHttps = keycloakSection.GetValue<bool>("RequireHttpsMetadata", defaultValue: false);
        var keycloakValidIssuer = keycloakSection.GetValue<string>("ValidIssuer") ?? keycloakAuthority;

        services.AddAuthentication(options =>
        {
            options.DefaultScheme = KeycloakScheme;
            options.DefaultAuthenticateScheme = KeycloakScheme;
            options.DefaultChallengeScheme = KeycloakScheme;
        })
        .AddJwtBearer(KeycloakScheme, opt =>
        {
            opt.Authority = keycloakAuthority;
            opt.Audience = keycloakAudience;
            opt.RequireHttpsMetadata = keycloakRequireHttps;
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = keycloakValidIssuer,
                ValidateAudience = !string.IsNullOrEmpty(keycloakAudience),
                ValidAudiences = [keycloakAudience, "account"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                NameClaimType = "preferred_username",
                RoleClaimType = "roles"
            };

            // Allow SignalR WebSocket/SSE connections on /comments to authenticate via ?access_token=
            opt.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/comments"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddTransient<IClaimsTransformation, KeycloakClaimsTransformation>();
        services.AddScoped<CurrentUserAccessor>();
        services.AddScoped<ICurrentUser>(sp => sp.GetRequiredService<CurrentUserAccessor>());
        services.AddScoped<IIdentityDirectory, IdentityDirectory>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IEmailDispatcher, HangfireEmailDispatcher>();
        services.AddScoped<SendEmailJob>();
        services.AddScoped<IModuleSeeder, IdentitySeeder>();

        return services;
    }
}
