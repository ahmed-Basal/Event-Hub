using System.Diagnostics;
using BuildingBlocks.Contracts;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Behaviors;

/// <summary>
/// Pipeline behavior that logs MediatR request execution, user context,
/// execution duration, and slow-request warnings without duplicating exception error logs.
/// </summary>
public class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger,
    ICurrentUser currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private const long SlowRequestThresholdMs = 500;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var user = currentUser.Username ?? "Anonymous";

        logger.LogDebug("Starting MediatR request {RequestName} for user {User}", requestName, user);

        var stopwatch = Stopwatch.StartNew();
        try
        {
            var response = await next();
            stopwatch.Stop();

            var elapsedMs = stopwatch.ElapsedMilliseconds;
            if (elapsedMs > SlowRequestThresholdMs)
            {
                logger.LogWarning(
                    "Slow MediatR request {RequestName} took {ElapsedMilliseconds}ms (> {ThresholdMs}ms)",
                    requestName, elapsedMs, SlowRequestThresholdMs);
            }
            else
            {
                logger.LogDebug(
                    "Completed MediatR request {RequestName} in {ElapsedMilliseconds}ms",
                    requestName, elapsedMs);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            // ExceptionMiddleware logs the full error once for HTTP requests; log here at Debug to avoid duplicates.
            logger.LogDebug(
                ex,
                "MediatR request {RequestName} threw {ExceptionType} after {ElapsedMilliseconds}ms",
                requestName, ex.GetType().Name, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
