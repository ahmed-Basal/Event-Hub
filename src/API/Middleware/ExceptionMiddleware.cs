using System.Text.Json;
using Core.Application.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

public class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env) : IMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

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
        catch (NotFoundException ex)
        {
            await HandleNotFoundExceptionAsync(context, ex);
        }
        catch (BadRequestException ex)
        {
            await HandleBadRequestExceptionAsync(context, ex);
        }
        catch (UnauthorizedException ex)
        {
            await HandleUnauthorizedExceptionAsync(context, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            await HandleUnauthorizedExceptionAsync(context, ex.Message);
        }
        catch (ForbiddenException ex)
        {
            await HandleForbiddenExceptionAsync(context, ex.Message);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
    }

    private async Task HandleForbiddenExceptionAsync(HttpContext context, string message)
    {
        logger.LogWarning("Forbidden: [{Method}] {Path} | Error: {ErrorMessage}",
            context.Request.Method, context.Request.Path.Value, message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status403Forbidden;

        var response = new AppException(
            StatusCodes.Status403Forbidden,
            message,
            null,
            context.TraceIdentifier,
            context.Request.Path.Value ?? "/",
            context.Request.Method,
            DateTime.UtcNow
        );

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private async Task HandleNotFoundExceptionAsync(HttpContext context, NotFoundException ex)
    {
        logger.LogWarning(ex, "Resource not found: [{Method}] {Path} | Error: {ErrorMessage}",
            context.Request.Method, context.Request.Path.Value, ex.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status404NotFound;

        var response = new AppException(
            StatusCodes.Status404NotFound,
            ex.Message,
            null,
            context.TraceIdentifier,
            context.Request.Path.Value ?? "/",
            context.Request.Method,
            DateTime.UtcNow
        );

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private async Task HandleBadRequestExceptionAsync(HttpContext context, BadRequestException ex)
    {
        logger.LogWarning(ex, "Bad request: [{Method}] {Path} | Error: {ErrorMessage}",
            context.Request.Method, context.Request.Path.Value, ex.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        var response = new AppException(
            StatusCodes.Status400BadRequest,
            ex.Message,
            ex.Errors != null && ex.Errors.Count > 0 ? string.Join(", ", ex.Errors) : null,
            context.TraceIdentifier,
            context.Request.Path.Value ?? "/",
            context.Request.Method,
            DateTime.UtcNow
        );

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }

    private async Task HandleUnauthorizedExceptionAsync(HttpContext context, string message)
    {
        logger.LogWarning("Unauthorized: [{Method}] {Path} | Error: {ErrorMessage}",
            context.Request.Method, context.Request.Path.Value, message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;

        var response = new AppException(
            StatusCodes.Status401Unauthorized,
            message,
            null,
            context.TraceIdentifier,
            context.Request.Path.Value ?? "/",
            context.Request.Method,
            DateTime.UtcNow
        );

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
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

        var json = JsonSerializer.Serialize(response, JsonOptions);

        await context.Response.WriteAsync(json);
    }

    private static async Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex)
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
            Detail = "one or more validation errors has occurred"
        };

        await context.Response.WriteAsJsonAsync(validationProblemDetails);
    }
}
