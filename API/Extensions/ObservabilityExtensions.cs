using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;

namespace API.Extensions;

public static class ObservabilityExtensions
{
    /// <summary>
    /// Configures Serilog as the logging provider — writes structured logs to Console + Seq.
    /// Call this on WebApplicationBuilder before builder.Build().
    /// </summary>
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        var seqUrl = builder.Configuration["Seq:ServerUrl"] ?? "http://localhost:5341";

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}")
            .WriteTo.Seq(seqUrl)
            .CreateLogger();

        builder.Host.UseSerilog();
        return builder;
    }

    /// <summary>
    /// Registers OpenTelemetry tracing (Seq OTLP + Jaeger OTLP) and Prometheus metrics.
    /// </summary>
    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        IConfiguration config)
    {
        var serviceName = config["OpenTelemetry:ServiceName"] ?? "Reactivities.API";
        var seqOtlpEndpoint = config["OpenTelemetry:SeqOtlpEndpoint"] ?? "http://localhost:5341/ingest/otlp/v1/traces";
        var jaegerOtlpEndpoint = config["OpenTelemetry:JaegerOtlpEndpoint"] ?? "http://localhost:4317";

        services.AddOpenTelemetry()
            .ConfigureResource(resource =>
                resource.AddService(serviceName: serviceName, serviceVersion: "1.0.0"))
            .WithTracing(tracing => tracing
                .AddSource("Reactivities.Application")
                .AddAspNetCoreInstrumentation(opts =>
                {
                    opts.RecordException = true;
                    opts.Filter = ctx =>
                        !ctx.Request.Path.StartsWithSegments("/health") &&
                        !ctx.Request.Path.StartsWithSegments("/metrics");
                })
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation()
                .AddOtlpExporter("seq", opts =>
                {
                    opts.Endpoint = new Uri(seqOtlpEndpoint);
                    opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                })
                .AddOtlpExporter("jaeger", opts =>
                {
                    opts.Endpoint = new Uri(jaegerOtlpEndpoint);
                    opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                }))
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter("Reactivities.Application")
                .AddPrometheusExporter());

        return services;
    }
}
