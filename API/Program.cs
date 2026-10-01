using API.Extensions;
using API.Middleware;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog structured logging early
builder.AddSerilogLogging();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddTransient<ExceptionMiddleware>();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

// Serilog request logging for detailed HTTP diagnostics
app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

// Expose Prometheus metrics endpoint at /metrics
app.MapPrometheusScrapingEndpoint();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAppCors();

app.UseAuthorization();

app.MapControllers();

// Apply migrations and seed data
await app.MigrateAndSeedAsync();

app.Run();
