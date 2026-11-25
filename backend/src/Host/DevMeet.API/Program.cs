using System.Text.Json;
using Activities.Module;
using Comments.Module;
using DevMeet.API.Extensions;
using DevMeet.API.Middleware;
using DevMeet.API.Options;
using DevMeet.Shared.Events;
using Diagnostics.Module;
using FastEndpoints;
using Identity.Module;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Notifications.Module;
using Payments.Module;
using Profiles.Module;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogLogging();

builder.Services.AddOptions<ApiSettings>()
    .BindConfiguration(ApiSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddFastEndpoints(o =>
{
    o.Assemblies =
    [
        typeof(IdentityModule).Assembly,
        typeof(ActivitiesModule).Assembly,
        typeof(CommentsModule).Assembly,
        typeof(ProfilesModule).Assembly,
        typeof(NotificationsModule).Assembly,
        typeof(PaymentsModule).Assembly,
        typeof(DiagnosticsModule).Assembly
    ];
});

builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddResponseCompression(opts => opts.EnableForHttps = true);
builder.Services.AddTransient<ExceptionMiddleware>();
builder.Services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Register Strict Project-Isolated Modules
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddActivitiesModule(builder.Configuration);
builder.Services.AddCommentsModule(builder.Configuration);
builder.Services.AddProfilesModule(builder.Configuration);
builder.Services.AddNotificationsModule(builder.Configuration);
builder.Services.AddPaymentsModule(builder.Configuration);
builder.Services.AddDiagnosticsModule();

builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddAppSecurityServices(builder.Configuration);
builder.Services.AddAppOutputCache();
builder.Services.AddAppHangfire(builder.Configuration);
builder.Services.AddObservability(builder.Configuration);
builder.Services.AddAppOpenApi(builder.Configuration);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseResponseCompression();
app.UseMiddleware<ExceptionMiddleware>();

app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

app.MapPrometheusScrapingEndpoint();
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = WriteSafeHealthResponse
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteSafeHealthResponse
});
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteSafeHealthResponse
});

app.UseAppScalarDocumentation();
app.UseAppCors();
app.UseAppSecurity();

app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();

app.UseAppHangfire();
app.UseFastEndpoints();
app.MapCommentsModule();

await app.RunModuleSeedersAsync();

app.Run();

static Task WriteSafeHealthResponse(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json; charset=utf-8";
    var payload = new
    {
        status = report.Status.ToString(),
        totalDurationMs = Math.Round(report.TotalDuration.TotalMilliseconds, 2),
        checks = report.Entries.Select(e => new
        {
            name = e.Key,
            status = e.Value.Status.ToString(),
            durationMs = Math.Round(e.Value.Duration.TotalMilliseconds, 2),
            description = e.Value.Description
        })
    };
    return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
}
