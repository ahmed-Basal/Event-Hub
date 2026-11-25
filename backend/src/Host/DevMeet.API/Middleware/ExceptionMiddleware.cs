using System.Text.Json;

namespace DevMeet.API.Middleware;

public sealed class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env) : IMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Unauthorized: [{Method}] {Path} | {ErrorMessage}", context.Request.Method, context.Request.Path.Value, ex.Message);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                statusCode = 401,
                message = ex.Message,
                traceId = context.TraceIdentifier
            }, JsonOptions));
        }
        catch (KeyNotFoundException ex)
        {
            logger.LogWarning("NotFound: [{Method}] {Path} | {ErrorMessage}", context.Request.Method, context.Request.Path.Value, ex.Message);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                statusCode = 404,
                message = ex.Message,
                traceId = context.TraceIdentifier
            }, JsonOptions));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: [{Method}] {Path}", context.Request.Method, context.Request.Path.Value);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                statusCode = 500,
                message = env.IsDevelopment() ? ex.Message : "An unexpected error occurred.",
                details = env.IsDevelopment() ? ex.StackTrace : null,
                traceId = context.TraceIdentifier
            }, JsonOptions));
        }
    }
}
