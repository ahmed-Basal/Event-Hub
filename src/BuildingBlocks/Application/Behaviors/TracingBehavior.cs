using System.Diagnostics;
using Application.Observability;
using MediatR;

namespace Application.Behaviors;

public class TracingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public const string ActivitySourceName = DevMeetTelemetry.ActivitySourceName;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var requestType = requestName.EndsWith("Query", StringComparison.Ordinal) ? "query" : "command";

        using var activity = DevMeetTelemetry.ActivitySource.StartActivity(
            $"MediatR: {requestName}",
            ActivityKind.Internal);

        activity?.SetTag("mediatr.request", requestName);
        activity?.SetTag("mediatr.request_type", requestType);

        try
        {
            var response = await next();
            activity?.SetStatus(ActivityStatusCode.Ok);
            return response;
        }
        catch (Exception ex)
        {
            DevMeetTelemetry.RecordException(activity, ex);
            throw;
        }
    }
}
