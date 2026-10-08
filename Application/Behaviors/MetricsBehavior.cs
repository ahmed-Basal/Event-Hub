using System.Diagnostics;
using System.Diagnostics.Metrics;
using MediatR;

namespace Application.Behaviors;

public class MetricsBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public const string MeterName = "DevMeet.Application";
    private static readonly Meter _meter = new(MeterName, "1.0.0");

    private static readonly Counter<long> _requestCounter =
        _meter.CreateCounter<long>(
            "mediatr_requests_total",
            description: "Total number of MediatR requests processed");

    private static readonly Histogram<double> _requestDuration =
        _meter.CreateHistogram<double>(
            "mediatr_request_duration_ms",
            unit: "ms",
            description: "Duration of MediatR request processing in milliseconds");

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var tags = new TagList { { "request", requestName } };

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
            _requestCounter.Add(1, tags);
            _requestDuration.Record(sw.Elapsed.TotalMilliseconds, tags);
        }
    }
}
