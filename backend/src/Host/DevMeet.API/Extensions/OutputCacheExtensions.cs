using Microsoft.AspNetCore.OutputCaching;

namespace DevMeet.API.Extensions;

public sealed class PublicEventsOutputCachePolicy : IOutputCachePolicy
{
    public ValueTask CacheRequestAsync(OutputCacheContext context, CancellationToken cancellation)
    {
        var request = context.HttpContext.Request;
        var hasAuthHeader = request.Headers.ContainsKey("Authorization");
        var isAuthenticated = context.HttpContext.User.Identity?.IsAuthenticated == true;

        var attemptCache = HttpMethods.IsGet(request.Method) && !hasAuthHeader && !isAuthenticated;
        context.EnableOutputCaching = attemptCache;
        context.AllowCacheLookup = attemptCache;
        context.AllowCacheStorage = attemptCache;
        context.AllowLocking = true;
        context.CacheVaryByRules.QueryKeys = "*";
        context.Tags.Add("activities");
        context.ResponseExpirationTimeSpan = TimeSpan.FromSeconds(60);

        return ValueTask.CompletedTask;
    }

    public ValueTask ServeFromCacheAsync(OutputCacheContext context, CancellationToken cancellation)
        => ValueTask.CompletedTask;

    public ValueTask ServeResponseAsync(OutputCacheContext context, CancellationToken cancellation)
    {
        var response = context.HttpContext.Response;
        if (!StringValuesIsEmpty(response.Headers.SetCookie) || response.StatusCode != StatusCodes.Status200OK)
        {
            context.AllowCacheStorage = false;
        }

        return ValueTask.CompletedTask;
    }

    private static bool StringValuesIsEmpty(Microsoft.Extensions.Primitives.StringValues values)
        => values.Count == 0;
}

public static class OutputCacheExtensions
{
    public static IServiceCollection AddAppOutputCache(this IServiceCollection services)
    {
        services.AddOutputCache(options =>
        {
            options.AddPolicy("PublicEvents", new PublicEventsOutputCachePolicy());
        });

        return services;
    }
}
