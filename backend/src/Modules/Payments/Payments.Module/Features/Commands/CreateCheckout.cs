using System.Net;
using System.Text.Json;
using Activities.Contracts;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Payments.Module.Domain;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Commands;

public sealed class CreateCheckoutRequest
{
    public string ActivityId { get; init; } = string.Empty;
}

public sealed class CreateCheckoutEndpoint(
    PaymentsDbContext db,
    IActivitiesDirectory activities,
    IIdentityDirectory identity,
    IPaymentService paymentService,
    ICurrentUser currentUser,
    IConfiguration config)
    : Endpoint<CreateCheckoutRequest, ApiResponse<CheckoutSessionResult>>
{
    public override void Configure()
    {
        Post("/api/payments/checkout/{activityId}");
    }

    public override async Task HandleAsync(CreateCheckoutRequest req, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        var idempotencyKey = HttpContext.Request.Headers["Idempotency-Key"].FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var scopeKey = $"checkout:{userId}:{req.ActivityId}:{idempotencyKey}";
            var cached = await db.IdempotencyRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.ScopeKey == scopeKey && r.ExpiresAtUtc > DateTimeOffset.UtcNow, ct);
            if (cached is not null)
            {
                HttpContext.Response.ContentType = "application/json";
                HttpContext.Response.StatusCode = cached.StatusCode;
                await HttpContext.Response.WriteAsync(cached.ResponseJson, ct);
                return;
            }
        }

        var activity = await activities.GetByIdAsync(req.ActivityId, ct);
        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<CheckoutSessionResult>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        if (activity.Price <= 0)
        {
            await Send.ResponseAsync(ApiResponse<CheckoutSessionResult>.Fail(HttpStatusCode.BadRequest, "This activity is free."), 400, ct);
            return;
        }

        var user = await identity.GetByIdAsync(userId, ct);
        if (user is null)
        {
            await Send.ResponseAsync(ApiResponse<CheckoutSessionResult>.Fail(HttpStatusCode.Unauthorized, "User not found."), 401, ct);
            return;
        }

        var order = TicketOrder.Create(activity.Id, userId, activity.Price, activity.Currency);
        var clientUrl = config["ClientAppUrl"] ?? config["ClientUrl"] ?? "http://localhost:3000";
        var successUrl = $"{clientUrl}/activities/{activity.Id}";
        var cancelUrl = $"{clientUrl}/activities/{activity.Id}";

        var session = await paymentService.CreateCheckoutSessionAsync(order, activity, user, successUrl, cancelUrl, ct);
        order.AttachStripeSession(session.SessionId);

        db.TicketOrders.Add(order);

        var response = ApiResponse<CheckoutSessionResult>.Ok(session);
        if (!string.IsNullOrWhiteSpace(idempotencyKey))
        {
            var scopeKey = $"checkout:{userId}:{req.ActivityId}:{idempotencyKey}";
            db.IdempotencyRecords.Add(IdempotencyRecord.Create(
                scopeKey,
                200,
                JsonSerializer.Serialize(response),
                TimeSpan.FromHours(24)));
        }

        await db.SaveChangesAsync(ct);
        await Send.OkAsync(response, ct);
    }
}
