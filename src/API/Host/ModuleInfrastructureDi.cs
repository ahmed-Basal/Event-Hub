using System.Text;
using Application.Interfaces;
using Infrastructure.Data;
using Infrastructure.Email;
using Infrastructure.Notifications;
using Infrastructure.Outbox;
using Infrastructure.Payments;
using Infrastructure.Photos;
using Infrastructure.Security;
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

        // ── 2. Security & Authentication (JWT, Identity & Keycloak OIDC) ────
        services.AddOptions<JwtOptions>()
            .BindConfiguration(JwtOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<KeycloakOptions>()
            .BindConfiguration(KeycloakOptions.SectionName);

        var keycloakSection = config.GetSection(KeycloakOptions.SectionName);
        var keycloakEnabled = keycloakSection.GetValue<bool>("Enabled", defaultValue: true);
        var keycloakAuthority = keycloakSection.GetValue<string>("Authority") ?? "http://localhost:8082/realms/reactivities";
        var keycloakAudience = keycloakSection.GetValue<string>("Audience") ?? "account";
        var keycloakRequireHttps = keycloakSection.GetValue<bool>("RequireHttpsMetadata", defaultValue: false);
        var keycloakValidIssuer = keycloakSection.GetValue<string>("ValidIssuer") ?? keycloakAuthority;

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, opt =>
        {
            var jwtOptions = config.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
                ?? throw new InvalidOperationException("Jwt configuration section is missing.");
            if (string.IsNullOrWhiteSpace(jwtOptions.TokenKey) || jwtOptions.TokenKey.Length < 64)
            {
                throw new InvalidOperationException("Jwt:TokenKey must be configured and at least 64 characters long.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.TokenKey));

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
                    ValidAudience = keycloakAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = "preferred_username",
                    RoleClaimType = "roles"
                };
            });
        }

        services.AddAuthorization(options =>
        {
            if (keycloakEnabled)
            {
                var defaultPolicy = new AuthorizationPolicyBuilder(
                    JwtBearerDefaults.AuthenticationScheme,
                    "Keycloak"
                )
                .RequireAuthenticatedUser()
                .Build();

                options.DefaultPolicy = defaultPolicy;
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
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPhotoAccessor, PhotoAccessor>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IGitHubAuthService, GitHubAuthService>();
        services.AddScoped<IPaymentService, StripePaymentService>();
        services.AddSingleton<IOutboxWakeup, OutboxWakeup>();
        services.AddHostedService<OutboxProcessor>();
        services.AddSingleton<ISseNotificationBroker, SseNotificationBroker>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

        return services;
    }
}
