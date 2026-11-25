using FastEndpoints;
using FluentValidation;
using Microsoft.Extensions.Hosting;

namespace Diagnostics.Module.Features.Queries;

public sealed class GetNotFoundEndpoint(IHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/buggy/not-found");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        await Send.NotFoundAsync(ct);
    }
}

public sealed class GetBadRequestEndpoint(IHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/buggy/bad-request");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        await Send.ResponseAsync(new { message = "This is a bad request exception." }, 400, ct);
    }
}

public sealed class GetServerErrorEndpoint(IHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/buggy/server-error");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        throw new Exception("This is a simulated internal server error.");
    }
}

public sealed class GetUnauthorizedEndpoint(IHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/buggy/unauthorized", "/api/buggy/unauthorised");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        await Send.UnauthorizedAsync(ct);
    }
}

public sealed class GetForbiddenEndpoint(IHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/buggy/forbidden");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        await Send.ForbiddenAsync(ct);
    }
}

public sealed class ValidationErrorRequest
{
    public string RequiredField { get; init; } = string.Empty;
}

public sealed class ValidationErrorValidator : Validator<ValidationErrorRequest>
{
    public ValidationErrorValidator() => RuleFor(x => x.RequiredField).NotEmpty();
}

public sealed class GetValidationErrorEndpoint(IHostEnvironment env) : Endpoint<ValidationErrorRequest>
{
    public override void Configure()
    {
        Post("/api/buggy/validation-error");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ValidationErrorRequest req, CancellationToken ct)
    {
        if (!env.IsDevelopment()) { await Send.NotFoundAsync(ct); return; }
        await Send.OkAsync(new { succeeded = true }, ct);
    }
}
