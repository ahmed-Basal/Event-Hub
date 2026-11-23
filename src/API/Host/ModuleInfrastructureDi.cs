using System.Text;
using Application.Interfaces;
using Infrastructure.Data;
using Infrastructure.Email;
using Infrastructure.Notifications;
using Infrastructure.Outbox;
using Infrastructure.Payments;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure;

public static class ModuleInfrastructureDi
{
    public static IServiceCollection AddInfrastructureDi(
        this IServiceCollection services, 
        IConfiguration config)
    {
        // ── 1. Data Access (EF Core / PostgreSQL) ───────────────────────────
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<DevMeetDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));
        });

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<DevMeetDbContext>());

        // ── 2. Security & Authentication (Keycloak OIDC Primary + Optional Legacy JWT) ────
        services.AddOptions<JwtOptions>()
            .BindConfiguration(JwtOptions.SectionName);

        services.AddOptions<KeycloakOptions>()
            .BindConfiguration(KeycloakOptions.SectionName);

        var jwtOptions = config.GetSection(JwtOptions.SectionName).Get<JwtOptions>();
        var legacyJwtConfigured = !string.IsNullOrWhiteSpace(jwtOptions?.TokenKey) && jwtOptions.TokenKey.Length >= 64;

        var keycloakSection = config.GetSection(KeycloakOptions.SectionName);
        var keycloakEnabled = keycloakSection.GetValue<bool>("Enabled", defaultValue: true);
        var keycloakAuthority = keycloakSection.GetValue<string>("Authority") ?? "http://localhost:8082/realms/reactivities";
        var keycloakAudience = keycloakSection.GetValue<string>("Audience") ?? "reactivities-api";
        var keycloakRequireHttps = keycloakSection.GetValue<bool>("RequireHttpsMetadata", defaultValue: false);
        var keycloakValidIssuer = keycloakSection.GetValue<string>("ValidIssuer") ?? keycloakAuthority;

        var defaultScheme = keycloakEnabled && !legacyJwtConfigured
            ? "Keycloak"
            : JwtBearerDefaults.AuthenticationScheme;

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultScheme = defaultScheme;
            options.DefaultAuthenticateScheme = defaultScheme;
            options.DefaultChallengeScheme = defaultScheme;
        });

        if (legacyJwtConfigured)
        {
            authBuilder.AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, opt =>
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions!.TokenKey));

                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = !string.IsNullOrWhiteSpace(jwtOptions.Issuer),
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = !string.IsNullOrWhiteSpace(jwtOptions.Audience),
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                opt.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/comments"))
                        {
                            context.Token = accessToken;
                            return Task.CompletedTask;
                        }

                        var token = context.Request.Cookies["jwtToken"];
                        if (!string.IsNullOrEmpty(token))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
        }

        if (keycloakEnabled)
        {
            authBuilder.AddJwtBearer("Keycloak", opt =>
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
            });
        }

        services.AddTransient<IClaimsTransformation, KeycloakClaimsTransformation>();

        services.AddAuthorization(options =>
        {
            var activeSchemes = new List<string>();
            if (legacyJwtConfigured) activeSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
            if (keycloakEnabled) activeSchemes.Add("Keycloak");

            if (activeSchemes.Count > 0)
            {
                options.DefaultPolicy = new AuthorizationPolicyBuilder([.. activeSchemes])
                    .RequireAuthenticatedUser()
                    .Build();
            }

            options.AddPolicy(IsHostRequirement.PolicyName, policy =>
            {
                policy.Requirements.Add(new IsHostRequirement());
            });
        });

        services.AddOptions<CloudinarySettings>()
            .BindConfiguration(CloudinarySettings.SectionName);
        services.AddOptions<ResendSettings>()
            .BindConfiguration(ResendSettings.SectionName);
        services.AddOptions<StripeSettings>()
            .BindConfiguration(StripeSettings.SectionName);

        services.AddHttpClient();
        services.AddHttpContextAccessor();
        services.AddScoped<IUserAccessor, UserAccessor>();
        services.AddScoped<BuildingBlocks.Contracts.ICurrentUser>(sp => sp.GetRequiredService<UserAccessor>());
        services.AddScoped<UserAccessor>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPhotoAccessor, PhotoAccessor>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IGitHubAuthService, GitHubAuthService>();
        services.AddScoped<IPaymentService, StripePaymentService>();
        services.AddScoped<BuildingBlocks.Contracts.IIdempotencyStore, Infrastructure.Payments.PostgresIdempotencyStore>();
        services.AddSingleton<IOutboxWakeup, OutboxWakeup>();
        services.AddHostedService<OutboxProcessor>();
        services.AddSingleton<ISseNotificationBroker, SseNotificationBroker>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

        return services;
    }
}
