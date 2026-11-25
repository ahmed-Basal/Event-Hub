using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Domain;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Commands;

public sealed class ProcessStripeWebhookEndpoint(
    PaymentsDbContext db,
    IPaymentService paymentService)
    : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/api/payments/webhook");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        using var reader = new StreamReader(HttpContext.Request.Body);
        var payload = await reader.ReadToEndAsync(ct);
        var sigHeader = HttpContext.Request.Headers["Stripe-Signature"].ToString();

        var parsed = paymentService.ParseWebhook(payload, sigHeader);
        if (!parsed.IsValid)
        {
            await Send.ResponseAsync(new { message = "Invalid webhook signature." }, 400, ct);
            return;
        }

        if (await db.ProcessedWebhookEvents.AnyAsync(e => e.EventId == parsed.EventId, ct))
        {
            await Send.OkAsync(new { received = true }, ct);
            return;
        }

        db.ProcessedWebhookEvents.Add(ProcessedWebhookEvent.Create(parsed.EventId, parsed.EventType, parsed.OrderId));

        if (parsed.EventType == "checkout.session.completed" && !string.IsNullOrWhiteSpace(parsed.OrderId))
        {
            var order = await db.TicketOrders.FirstOrDefaultAsync(o => o.Id == parsed.OrderId, ct);
            if (order is not null && order.Status == PaymentStatus.Pending)
            {
                order.MarkPaid(parsed.PaymentIntentId);
            }
        }

        await db.SaveChangesAsync(ct);
        await Send.OkAsync(new { received = true }, ct);
    }
}
