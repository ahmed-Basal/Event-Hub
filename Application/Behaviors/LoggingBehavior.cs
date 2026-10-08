using System.Diagnostics;
using Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Behaviors;

/// <summary>
/// Pipeline behavior that logs MediatR request execution, user context, 
/// execution duration, performance warnings for slow queries, and failures.
/// </summary>
public class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger,
    IUserAccessor userAccessor)
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
        var userId = userAccessor.GetUsername() ?? "Anonymous";

        logger.LogInformation(
            "Starting MediatR request {RequestName} for user [{UserId}]",
            requestName, userId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            var elapsedMs = stopwatch.ElapsedMilliseconds;

            if (elapsedMs > SlowRequestThresholdMs)
            {
                logger.LogWarning(
                    "Long-running request detected: {RequestName} took {ElapsedMs}ms (> {Threshold}ms) for user [{UserId}]",
                    requestName, elapsedMs, SlowRequestThresholdMs, userId);
            }
            else
            {
                logger.LogInformation(
                    "Completed MediatR request {RequestName} in {ElapsedMs}ms for user [{UserId}]",
                    requestName, elapsedMs, userId);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            logger.LogError(
                ex,
                "MediatR request {RequestName} failed after {ElapsedMs}ms for user [{UserId}]: {ErrorMessage}",
                requestName, stopwatch.ElapsedMilliseconds, userId, ex.Message);
            throw;
        }
    }
}
