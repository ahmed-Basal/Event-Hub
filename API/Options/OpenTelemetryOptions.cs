namespace API.Options;

public class OpenTelemetryOptions
{
    public const string SectionName = "OpenTelemetry";

    public string ServiceName { get; set; } = "DevMeet.API";
    public string SeqOtlpEndpoint { get; set; } = "http://localhost:5341/ingest/otlp/v1/traces";
    public string JaegerOtlpEndpoint { get; set; } = "http://localhost:4317";
}
