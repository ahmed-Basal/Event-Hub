using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Extensions;

public static class SecurityExtensions
{
    public const string AuthRateLimitPolicy = "auth";

    /// <summary>
    /// Configures enterprise-grade security services: HSTS, Cookie Security Policies, and Rate Limiting.
    /// </summary>
    public static IServiceCollection AddAppSecurityServices(
        this IServiceCollection services,
        IConfiguration? config = null)
    {
        // 1. HSTS (HTTP Strict Transport Security) - Enforces HTTPS only at the browser level
        services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(365);
            // Clear default excluded hosts (like localhost) so HSTS is emitted across all environments
            options.ExcludedHosts.Clear();
        });

        // 2. HTTPS Redirection (Enforces permanent 308 redirection from HTTP to HTTPS)
        services.AddHttpsRedirection(options =>
        {
            options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
            options.HttpsPort = config?.GetValue<int?>("HttpsPort") ?? 7223;
        });

        // 2. Cookie Policy (Enforces HttpOnly and Secure flags across all cookies)
        services.Configure<CookiePolicyOptions>(options =>
        {
            options.HttpOnly = HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.Always;
            options.MinimumSameSitePolicy = SameSiteMode.None; // Required for SPA on different port in development
        });

        // 3. ASP.NET Core Built-in Rate Limiting (.NET 8/9+)
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

            // Global IP-based Sliding Window: 100 requests per minute per IP
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

            // Strict Policy for Auth Endpoints (Login/Register): 10 requests per minute to prevent Brute-Force
            options.AddFixedWindowLimiter(policyName: AuthRateLimitPolicy, opt =>
            {
                opt.PermitLimit = 10;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueLimit = 0;
            });
        });

        return services;
    }

    /// <summary>
    /// Configures security middleware pipeline: Security Headers, Cookie Policy, HSTS, and Rate Limiting.
    /// </summary>
    public static WebApplication UseAppSecurity(this WebApplication app)
    {
        // 1. Enforce HSTS (Strict-Transport-Security header: max-age=31536000; includeSubDomains; preload)
        app.UseHsts();

        // 2. Enforce HTTPS Redirection (Auto-redirect all HTTP calls to HTTPS with 308 Permanent Redirect)
        app.UseHttpsRedirection();

        // Security Headers Middleware (OWASP recommended defense-in-depth headers)
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

            await next();
        });

        // Enforce Cookie Policy (HttpOnly, Secure)
        app.UseCookiePolicy();

        // Rate Limiter Middleware
        app.UseRateLimiter();

        return app;
    }
}
