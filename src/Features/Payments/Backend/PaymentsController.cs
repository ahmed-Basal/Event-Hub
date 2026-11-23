using API.Filters;
using Application.Feature.Payments.Commands.CreateCheckout;
using Application.Feature.Payments.Commands.ProcessStripeWebhook;
using Application.Feature.Payments.Commands.SandboxCompleteOrder;
using Application.Feature.Payments.Queries.GetMyOrders;
using Application.Feature.Payments.Queries.GetOrderStatus;
using Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class PaymentsController(
    ISender mediator,
    IPaymentService paymentService,
    IWebHostEnvironment env) : BaseApiController
{
    [Authorize]
    [IdempotentPayment]
    [HttpPost("checkout/{activityId}")]
    public async Task<ActionResult> CreateCheckout(string activityId, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new CreateCheckoutCommand { ActivityId = activityId }, ct));
    }

    /// <summary>
    /// Stripe Webhook endpoint: verifies Stripe-Signature,
    /// deduplicates by Stripe EventId, idempotently marks TicketOrder paid,
    /// confirms attendee RSVP, and queues Outbox domain events.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<ActionResult> StripeWebhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(ct);
        var sigHeader = Request.Headers["Stripe-Signature"].ToString();

        var result = await mediator.Send(new ProcessStripeWebhookCommand
        {
            Payload = json,
            StripeSignature = sigHeader
        }, ct);

        return result.Succeeded
            ? Ok()
            : BadRequest(new { message = result.Message ?? "Invalid webhook signature." });
    }

    /// <summary>
    /// Development-only sandbox webhook trigger for testing Checkout -> Webhook -> RSVP -> SSE
    /// when Stripe keys are not configured.
    /// </summary>
    [Authorize]
    [HttpPost("sandbox-complete/{orderId}")]
    public async Task<ActionResult> SandboxComplete(string orderId, CancellationToken ct)
    {
        if (!env.IsDevelopment() && paymentService.IsStripeConfigured)
        {
            return Forbid();
        }

        return NewResult(await mediator.Send(new SandboxCompleteOrderCommand { OrderId = orderId }, ct));
    }

    [Authorize]
    [HttpGet("my-orders")]
    public async Task<ActionResult> GetMyOrders(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetMyOrdersQuery(), ct));
    }

    [Authorize]
    [HttpGet("orders/{orderId}/status")]
    public async Task<ActionResult> GetOrderStatus(string orderId, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetOrderStatusQuery { OrderId = orderId }, ct));
    }
}
