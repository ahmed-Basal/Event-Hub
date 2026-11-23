using System.Security.Claims;
using System.Text.Json;
using BuildingBlocks.Contracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Filters;

/// <summary>
/// Enforces a mandatory Idempotency-Key header on payment endpoints backed by a persistent store.
/// Rejects requests missing the header with 400 Bad Request and replays stored responses on duplicate keys.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class IdempotentPaymentAttribute() : TypeFilterAttribute(typeof(IdempotentPaymentFilter));

public sealed class IdempotentPaymentFilter(IIdempotencyStore idempotencyStore) : IAsyncActionFilter
{
    public const string HeaderName = "Idempotency-Key";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

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
        var scopeKey = $"idempotency:payment:{userId}:{context.HttpContext.Request.Path}:{idempotencyKey}";

        var ct = context.HttpContext.RequestAborted;
        var cached = await idempotencyStore.GetAsync(scopeKey, ct);
        if (cached is not null)
        {
            context.HttpContext.Response.Headers["X-Idempotent-Replay"] = "true";
            var parsedValue = JsonSerializer.Deserialize<JsonElement>(cached.ResponseJson);
            context.Result = new ObjectResult(parsedValue)
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
                var json = JsonSerializer.Serialize(objectResult.Value);
                await idempotencyStore.SaveAsync(scopeKey, statusCode, json, CacheDuration, ct);
            }
        }
    }
}
