using API;
using API.Configuration;
using API.Extensions;
using API.Middleware;
using Core;
using Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogLogging();

// Register Dependencies Layer by Layer (4-Layer Clean Architecture)
builder.Services.AddCoreDi(builder.Configuration);
builder.Services.AddInfrastructureDi(builder.Configuration);
builder.Services.AddApiDi(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

app.UseApiConfigurations();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
{
    await app.MigrateAndSeedAsync();
}

app.Run();
