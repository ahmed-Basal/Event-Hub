using API.Options;
using Core.Application.Behaviors;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;

namespace API.Extensions;

public static class ObservabilityExtensions
{
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        var seqOptions = builder.Configuration.GetSection(SeqOptions.SectionName).Get<SeqOptions>() ?? new SeqOptions();

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] [{TraceId}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}")
            .WriteTo.Seq(seqOptions.ServerUrl)
            .CreateLogger();

        builder.Host.UseSerilog();
        return builder;
    }

    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddOptions<SeqOptions>()
            .BindConfiguration(SeqOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<OpenTelemetryOptions>()
            .BindConfiguration(OpenTelemetryOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var otelOptions = config.GetSection(OpenTelemetryOptions.SectionName).Get<OpenTelemetryOptions>() ?? new OpenTelemetryOptions();

        services.AddHealthChecks();

        services.AddOpenTelemetry()
            .ConfigureResource(resource =>
                resource.AddService(serviceName: otelOptions.ServiceName, serviceVersion: "1.0.0"))
            .WithTracing(tracing => tracing
                .AddSource(TracingBehavior<object, object>.ActivitySourceName)
                .AddAspNetCoreInstrumentation(opts =>
                {
                    opts.RecordException = true;
                    opts.Filter = ctx =>
                        !ctx.Request.Path.StartsWithSegments("/health") &&
                        !ctx.Request.Path.StartsWithSegments("/metrics") &&
                        !ctx.Request.Path.StartsWithSegments("/openapi");
                })
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation()
                .AddOtlpExporter("seq", opts =>
                {
                    opts.Endpoint = new Uri(otelOptions.SeqOtlpEndpoint);
                    opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                })
                .AddOtlpExporter("jaeger", opts =>
                {
                    opts.Endpoint = new Uri(otelOptions.JaegerOtlpEndpoint);
                    opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                }))
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter(MetricsBehavior<object, object>.MeterName)
                .AddPrometheusExporter());

        return services;
    }
}
