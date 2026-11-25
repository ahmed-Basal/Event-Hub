using System.Threading.RateLimiting;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.RateLimiting;

namespace DevMeet.API.Extensions;

public static class SecurityExtensions
{
    public const string AuthRateLimitPolicy = "auth";

    public static IServiceCollection AddAppSecurityServices(
        this IServiceCollection services,
        IConfiguration? config = null)
    {
        services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(365);
            options.ExcludedHosts.Clear();
        });

        services.AddHttpsRedirection(options =>
        {
            options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
            options.HttpsPort = config?.GetValue<int?>("HttpsPort") ?? 7223;
        });

        services.Configure<CookiePolicyOptions>(options =>
        {
            options.HttpOnly = HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.Always;
            options.MinimumSameSitePolicy = SameSiteMode.None;
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.OnRejected = async (context, cancellationToken) =>
            {
                context.HttpContext.Response.ContentType = "application/problem+json";

                var retryAfter = 60;
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterTimeSpan))
                {
                    retryAfter = (int)retryAfterTimeSpan.TotalSeconds;
                }

                context.HttpContext.Response.Headers.RetryAfter = retryAfter.ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    type = "https://httpstatuses.com/429",
                    title = "Too Many Requests",
                    status = StatusCodes.Status429TooManyRequests,
                    detail = $"Rate limit exceeded. Please try again after {retryAfter} seconds.",
                    instance = context.HttpContext.Request.Path.Value
                }, cancellationToken);
            };

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var clientIp = httpContext.Connection.RemoteIpAddress?.ToString()
                    ?? httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                    ?? "anonymous";

                return RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: clientIp,
                    factory: _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        SegmentsPerWindow = 6,
                        QueueLimit = 0
                    });
            });

            options.AddFixedWindowLimiter(policyName: AuthRateLimitPolicy, opt =>
            {
                opt.PermitLimit = 10;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueLimit = 0;
            });
        });

        return services;
    }

    public static WebApplication UseAppSecurity(this WebApplication app)
    {
        var disableHttpsRedirection =
            app.Environment.IsEnvironment("Docker") ||
            app.Configuration.GetValue<bool>("DisableHttpsRedirection");

        if (!disableHttpsRedirection)
        {
            app.UseHsts();
            app.UseHttpsRedirection();
        }

        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

            await next();
        });

        app.UseCookiePolicy();
        app.UseRateLimiter();

        return app;
    }
}
