using API;
using API.Extensions;
using API.Middleware;
using Application;
using Infrastructure;
using Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogLogging();

// Register Dependencies Layer by Layer
builder.Services.AddApplicationDi(builder.Configuration);
builder.Services.AddPersistenceDi(builder.Configuration);
builder.Services.AddInfrastructureDi(builder.Configuration);
builder.Services.AddApiDi(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

app.MapPrometheusScrapingEndpoint();
app.MapHealthChecks("/health");

app.UseAppScalarDocumentation();

app.UseAppCors();

app.UseAppSecurity();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
{
    await app.MigrateAndSeedAsync();
}

app.Run();
