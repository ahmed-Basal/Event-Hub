using API.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Caching.Memory;

namespace Core.Tests;

public class IdempotentPaymentFilterTests
{
    private static ActionExecutingContext CreateContext(string? idempotencyKey = null)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/payments/checkout/act-1";
        if (idempotencyKey is not null)
        {
            httpContext.Request.Headers[IdempotentPaymentFilter.HeaderName] = idempotencyKey;
        }

        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        return new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>(),
            new object());
    }

    [Fact]
    public async Task MissingHeader_ShouldReturn400BadRequest_AndSkipAction()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var filter = new IdempotentPaymentFilter(cache);
        var context = CreateContext();
        var invoked = false;

        await filter.OnActionExecutionAsync(context, () =>
        {
            invoked = true;
            return Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object()));
        });

        Assert.False(invoked);
        var badRequest = Assert.IsType<BadRequestObjectResult>(context.Result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task SameIdempotencyKey_ShouldReplayCachedResponse_WithoutReExecuting()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var filter = new IdempotentPaymentFilter(cache);
        var key = Guid.NewGuid().ToString();
        var executionCount = 0;

        ActionExecutionDelegate next = () =>
        {
            executionCount++;
            var ctx = CreateContext(key);
            var executed = new ActionExecutedContext(ctx, new List<IFilterMetadata>(), new object())
            {
                Result = new OkObjectResult(new { orderId = "ord-123" })
            };
            return Task.FromResult(executed);
        };

        var ctx1 = CreateContext(key);
        await filter.OnActionExecutionAsync(ctx1, next);
        Assert.Equal(1, executionCount);

        var ctx2 = CreateContext(key);
        await filter.OnActionExecutionAsync(ctx2, next);
        Assert.Equal(1, executionCount);
        Assert.Equal("true", ctx2.HttpContext.Response.Headers["X-Idempotent-Replay"].ToString());
        var replayResult = Assert.IsType<ObjectResult>(ctx2.Result);
        Assert.Equal(200, replayResult.StatusCode);
    }
}
