using System.Diagnostics;
using System.Diagnostics.Metrics;
using API.Extensions;
using Application.Behaviors;
using Application.Observability;
using MediatR;
using Serilog.Events;
using Serilog.Parsing;

namespace Core.Tests;

public class ObservabilityTests
{
    private sealed record SamplePingQuery : IRequest<string>;

    [Fact]
    public async Task TracingBehavior_ShouldEmitSpan_WithRequestTagsAndOkStatus()
    {
        var recorded = new List<Activity>();
        using var listener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == DevMeetTelemetry.ActivitySourceName,
            Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded,
            ActivityStopped = a => recorded.Add(a)
        };
        ActivitySource.AddActivityListener(listener);

        var behavior = new TracingBehavior<SamplePingQuery, string>();
        var result = await behavior.Handle(new SamplePingQuery(), _ => Task.FromResult("pong"), CancellationToken.None);

        Assert.Equal("pong", result);
        var span = Assert.Single(recorded, a => a.DisplayName == "MediatR: SamplePingQuery");
        Assert.Equal("SamplePingQuery", span.GetTagItem("mediatr.request"));
        Assert.Equal("query", span.GetTagItem("mediatr.request_type"));
        Assert.Equal(ActivityStatusCode.Ok, span.Status);
    }

    [Fact]
    public async Task TracingBehavior_OnException_ShouldSetErrorStatusAndRecordExceptionEvent()
    {
        var recorded = new List<Activity>();
        using var listener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == DevMeetTelemetry.ActivitySourceName,
            Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded,
            ActivityStopped = a => recorded.Add(a)
        };
        ActivitySource.AddActivityListener(listener);

        var behavior = new TracingBehavior<SamplePingQuery, string>();
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            behavior.Handle(new SamplePingQuery(), _ => throw new InvalidOperationException("boom"), CancellationToken.None));

        var span = Assert.Single(recorded, a => a.DisplayName == "MediatR: SamplePingQuery");
        Assert.Equal(ActivityStatusCode.Error, span.Status);
        Assert.Contains(span.Events, e => e.Name == "exception");
    }

    [Fact]
    public async Task MetricsBehavior_ShouldRecordCounterAndHistogram()
    {
        var measurements = new List<(string Instrument, double Value)>();
        using var listener = new MeterListener
        {
            InstrumentPublished = (instrument, meterListener) =>
            {
                if (instrument.Meter.Name == DevMeetTelemetry.MeterName)
                {
                    meterListener.EnableMeasurementEvents(instrument);
                }
            }
        };
        listener.SetMeasurementEventCallback<long>((inst, val, _, _) => measurements.Add((inst.Name, val)));
        listener.SetMeasurementEventCallback<double>((inst, val, _, _) => measurements.Add((inst.Name, val)));
        listener.Start();

        var behavior = new MetricsBehavior<SamplePingQuery, string>();
        await behavior.Handle(new SamplePingQuery(), _ => Task.FromResult("ok"), CancellationToken.None);

        Assert.Contains(measurements, m => m.Instrument == "mediatr_requests_total" && m.Value == 1);
        Assert.Contains(measurements, m => m.Instrument == "mediatr_request_duration_ms" && m.Value >= 0);
    }

    [Fact]
    public void SerilogActivityEnricher_ShouldAttachTraceIdAndSpanId_WhenActivityIsActive()
    {
        using var activity = new Activity("test-op").Start();
        var enricher = new SerilogActivityEnricher("DevMeet.API", "Development");
        var logEvent = new LogEvent(
            DateTimeOffset.UtcNow,
            LogEventLevel.Information,
            null,
            new MessageTemplate([]),
            []);

        enricher.Enrich(logEvent, new SimplePropertyFactory());

        Assert.Equal($"\"{activity.TraceId}\"", logEvent.Properties["TraceId"].ToString());
        Assert.Equal($"\"{activity.SpanId}\"", logEvent.Properties["SpanId"].ToString());
        Assert.Equal("\"DevMeet.API\"", logEvent.Properties["ServiceName"].ToString());
    }

    private sealed class SimplePropertyFactory : Serilog.Core.ILogEventPropertyFactory
    {
        public LogEventProperty CreateProperty(string name, object? value, bool destructureObjects = false)
            => new(name, new ScalarValue(value));
    }
}
