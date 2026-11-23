using API;
using API.Configuration;
using API.Extensions;
using API.Middleware;
using API.SignalR;
using Application;
using Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogLogging();

// Register Dependencies Layer by Layer (4-Layer Clean Architecture)
builder.Services.AddApplicationDi(builder.Configuration);
builder.Services.AddInfrastructureDi(builder.Configuration);
builder.Services.AddApiDi(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddResponseCompression(opts =>
{
    opts.EnableForHttps = true;
});

var app = builder.Build();

app.UseResponseCompression();
app.UseMiddleware<ExceptionMiddleware>();

app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    opts.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        var activity = System.Diagnostics.Activity.Current;
        if (activity is not null)
        {
            diagnosticContext.Set("TraceId", activity.TraceId.ToString());
            diagnosticContext.Set("SpanId", activity.SpanId.ToString());
        }

        if (httpContext.GetEndpoint() is RouteEndpoint routeEndpoint &&
            routeEndpoint.RoutePattern.RawText is { } routeTemplate)
        {
            diagnosticContext.Set("RouteTemplate", routeTemplate);
        }
    };
});

app.UseApiConfigurations();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<CommentHub>("/comments");

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
{
    await app.MigrateAndSeedAsync();
}

app.Run();
