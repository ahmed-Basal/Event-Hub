using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Domain;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Commands;

public sealed class RefundOrderRequest
{
    public string OrderId { get; init; } = string.Empty;
}

public sealed class RefundOrderEndpoint(PaymentsDbContext db, IPaymentService paymentService)
    : Endpoint<RefundOrderRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/admin/orders/{orderId}/refund");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(RefundOrderRequest req, CancellationToken ct)
    {
        var order = await db.TicketOrders.FirstOrDefaultAsync(o => o.Id == req.OrderId, ct);
        if (order is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Order not found."), 404, ct);
            return;
        }

        if (order.Status != PaymentStatus.Paid)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.BadRequest, "Only paid orders can be refunded."), 400, ct);
            return;
        }

        if (!string.IsNullOrWhiteSpace(order.StripePaymentIntentId))
        {
            await paymentService.RefundPaymentAsync(order.StripePaymentIntentId, ct);
        }

        order.MarkRefunded();
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Order refunded."), ct);
    }
}
