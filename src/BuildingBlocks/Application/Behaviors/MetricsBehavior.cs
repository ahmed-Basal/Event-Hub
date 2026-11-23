using System.Diagnostics;
using Application.Observability;
using MediatR;

namespace Application.Behaviors;

public class MetricsBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public const string MeterName = DevMeetTelemetry.MeterName;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var requestType = requestName.EndsWith("Query", StringComparison.Ordinal) ? "query" : "command";
        var tags = new TagList
        {
            { "request", requestName },
            { "request_type", requestType }
        };

        var sw = Stopwatch.StartNew();
        try
        {
            var response = await next();
            tags.Add("status", "success");
            return response;
        }
        catch
        {
            tags.Add("status", "error");
            throw;
        }
        finally
        {
            sw.Stop();
            DevMeetTelemetry.MediatRRequestsTotal.Add(1, tags);
            DevMeetTelemetry.MediatRRequestDurationMs.Record(sw.Elapsed.TotalMilliseconds, tags);
        }
    }
}
