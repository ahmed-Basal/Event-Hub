using System.Diagnostics;
using DevMeet.API.Extensions;
using Serilog.Events;
using Serilog.Parsing;

namespace Core.Tests;

public class ObservabilityTests
{
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
