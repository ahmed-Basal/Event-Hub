using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;

namespace API.Filters;

/// <summary>
/// Enforces a mandatory Idempotency-Key header on payment endpoints with a 10-minute replay cache.
/// Rejects requests missing the header with 400 Bad Request and replays cached responses on duplicate keys.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class IdempotentPaymentAttribute() : TypeFilterAttribute(typeof(IdempotentPaymentFilter));

public sealed class IdempotentPaymentFilter(IMemoryCache cache) : IAsyncActionFilter
{
    public const string HeaderName = "Idempotency-Key";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    private sealed record CachedResponse(object? Value, int StatusCode);

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(HeaderName, out var keyValues) ||
            string.IsNullOrWhiteSpace(keyValues.ToString()))
        {
            context.Result = new BadRequestObjectResult(new
            {
                succeeded = false,
                message = $"Missing required '{HeaderName}' header. Payment cannot proceed without an idempotency key."
            });
            return;
        }

        var idempotencyKey = keyValues.ToString().Trim();
        var userId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.HttpContext.User.FindFirstValue("sub")
            ?? "anonymous";
        var cacheKey = $"idempotency:payment:{userId}:{context.HttpContext.Request.Path}:{idempotencyKey}";

        if (cache.TryGetValue(cacheKey, out CachedResponse? cached) && cached is not null)
        {
            context.HttpContext.Response.Headers["X-Idempotent-Replay"] = "true";
            context.Result = new ObjectResult(cached.Value)
            {
                StatusCode = cached.StatusCode
            };
            return;
        }

        var executed = await next();

        if (executed.Exception is null && executed.Result is ObjectResult objectResult)
        {
            var statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
            if (statusCode is >= 200 and < 300)
            {
                cache.Set(
                    cacheKey,
                    new CachedResponse(objectResult.Value, statusCode),
                    new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = CacheDuration
                    });
            }
        }
    }
}
