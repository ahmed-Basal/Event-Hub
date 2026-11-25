using System.Diagnostics;
using DevMeet.API.Options;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Core;
using Serilog.Events;

namespace DevMeet.API.Extensions;

public sealed class SerilogActivityEnricher(string serviceName, string environmentName) : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("ServiceName", serviceName));
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("Environment", environmentName));

        var activity = Activity.Current;
        if (activity is not null)
        {
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("TraceId", activity.TraceId.ToString()));
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("SpanId", activity.SpanId.ToString()));
        }
    }
}

internal sealed class PostgresReadinessHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration.GetSection("ConnectionStrings:DefaultConnection").Value;

        if (string.IsNullOrWhiteSpace(connectionString))
            return HealthCheckResult.Unhealthy("PostgreSQL connection string is not configured.");

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(3));

            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync(cts.Token);
            await using var cmd = new NpgsqlCommand("SELECT 1;", conn);
            await cmd.ExecuteScalarAsync(cts.Token);

            return HealthCheckResult.Healthy("PostgreSQL connection verified.");
        }
        catch (Exception)
        {
            return HealthCheckResult.Unhealthy("PostgreSQL readiness check failed.");
        }
    }
}

public static class ObservabilityExtensions
{
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        var seqOptions = builder.Configuration.GetSection(SeqOptions.SectionName).Get<SeqOptions>() ?? new SeqOptions();
        var otelOptions = builder.Configuration.GetSection(OpenTelemetryOptions.SectionName).Get<OpenTelemetryOptions>() ?? new OpenTelemetryOptions();

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .Enrich.WithThreadId()
            .Enrich.With(new SerilogActivityEnricher(otelOptions.ServiceName, builder.Environment.EnvironmentName))
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] [{TraceId}:{SpanId}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}")
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

        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy("Process is alive."), tags: ["live"])
            .AddCheck<PostgresReadinessHealthCheck>("postgresql", tags: ["ready"]);

        services.AddOpenTelemetry()
            .ConfigureResource(resource =>
                resource.AddService(serviceName: otelOptions.ServiceName, serviceVersion: "1.0.0"))
            .WithTracing(tracing =>
            {
                tracing
                    .AddSource("DevMeet")
                    .AddAspNetCoreInstrumentation(opts =>
                    {
                        opts.RecordException = true;
                        opts.Filter = ctx =>
                            !ctx.Request.Path.StartsWithSegments("/health") &&
                            !ctx.Request.Path.StartsWithSegments("/metrics") &&
                            !ctx.Request.Path.StartsWithSegments("/openapi") &&
                            !ctx.Request.Path.StartsWithSegments("/scalar") &&
                            !ctx.Request.Path.StartsWithSegments("/hangfire");
                    })
                    .AddHttpClientInstrumentation(opts => opts.RecordException = true)
                    .AddEntityFrameworkCoreInstrumentation();

                if (!string.IsNullOrWhiteSpace(otelOptions.OtlpCollectorEndpoint))
                {
                    tracing.AddOtlpExporter("collector", opts =>
                    {
                        opts.Endpoint = new Uri(otelOptions.OtlpCollectorEndpoint);
                        opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                    });
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(otelOptions.SeqOtlpEndpoint))
                    {
                        tracing.AddOtlpExporter("seq", opts =>
                        {
                            opts.Endpoint = new Uri(otelOptions.SeqOtlpEndpoint);
                            opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                        });
                    }

                    if (!string.IsNullOrWhiteSpace(otelOptions.JaegerOtlpEndpoint))
                    {
                        tracing.AddOtlpExporter("jaeger", opts =>
                        {
                            opts.Endpoint = new Uri(otelOptions.JaegerOtlpEndpoint);
                            opts.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
                        });
                    }
                }
            })
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter("System.Runtime")
                .AddMeter("Microsoft.AspNetCore.Hosting")
                .AddMeter("Microsoft.AspNetCore.Routing")
                .AddMeter("DevMeet")
                .AddPrometheusExporter());

        return services;
    }
}
