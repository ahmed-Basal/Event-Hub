
using System.Text.Json;
using Application.Core;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

public class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
    }

    private async Task HandleException(HttpContext context, Exception ex)
    {
        var traceId = context.TraceIdentifier;
        var path = context.Request.Path.Value ?? "/";
        var method = context.Request.Method;

        logger.LogError(
            ex,
            "Unhandled Exception: [{Method}] {Path} | TraceId: {TraceId} | Error: {ErrorMessage}",
            method,
            path,
            traceId,
            ex.Message
        );

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var response = env.IsDevelopment()
            ? new AppException(
                context.Response.StatusCode,
                ex.Message,
                ex.StackTrace,
                traceId,
                path,
                method,
                DateTime.UtcNow
            )
            : new AppException(
                context.Response.StatusCode,
                "An internal server error occurred. Please provide the Trace ID to support if the issue persists.",
                null,
                traceId,
                path,
                method,
                DateTime.UtcNow
            );

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
    }

    private static  async Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex)
    {
        var validationErrors = new Dictionary<string, string[]>();

        if (ex.Errors is not null)
        {
            foreach (var error in ex.Errors)
            {
                if (validationErrors.TryGetValue(error.PropertyName, out var existingErrors))
                {
                    validationErrors[error.PropertyName] = [.. existingErrors, error.ErrorMessage];
                }
                else
                {
                    validationErrors.Add(error.PropertyName, [error.ErrorMessage]);
                }
            }
        }

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        var validationProblemDetails = new ValidationProblemDetails(validationErrors)
        {
            Title = "validation error",
            Status = StatusCodes.Status400BadRequest,
            Type = "validationfailure",
            Detail="one or more validation errors has  occurred"

        };

        await context.Response.WriteAsJsonAsync(validationProblemDetails);
    }

}
