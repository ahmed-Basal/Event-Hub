using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Behaviors;

public class TracingBehavior<TRequest, TResponse>(
    ILogger<TracingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public const string ActivitySourceName = "DevMeet.Application";
    private static readonly ActivitySource _activitySource = new(ActivitySourceName);

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        using var activity = _activitySource.StartActivity(
            $"MediatR: {requestName}",
            ActivityKind.Internal);

        activity?.SetTag("mediatr.request", requestName);

        try
        {
            var response = await next();
            activity?.SetStatus(ActivityStatusCode.Ok);
            return response;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.AddEvent(new ActivityEvent("exception", tags: new ActivityTagsCollection
            {
                { "exception.type", ex.GetType().FullName },
                { "exception.message", ex.Message },
                { "exception.stacktrace", ex.ToString() }
            }));
            logger.LogError(ex, "MediatR request {RequestName} failed", requestName);
            throw;
        }
    }
}
