using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Commands;

public sealed class SandboxCompleteOrderRequest
{
    public string OrderId { get; init; } = string.Empty;
}

public sealed class SandboxCompleteOrderEndpoint(
    PaymentsDbContext db,
    IPaymentService paymentService,
    ICurrentUser currentUser,
    IWebHostEnvironment env)
    : Endpoint<SandboxCompleteOrderRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/payments/sandbox-complete/{orderId}");
    }

    public override async Task HandleAsync(SandboxCompleteOrderRequest req, CancellationToken ct)
    {
        if (!env.IsDevelopment() && paymentService.IsStripeConfigured)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var order = await db.TicketOrders
            .FirstOrDefaultAsync(o => o.Id == req.OrderId && o.UserId == currentUser.UserId, ct);

        if (order is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Order not found."), 404, ct);
            return;
        }

        order.MarkPaid($"pi_sandbox_{order.Id}");
        await db.SaveChangesAsync(ct);

        await Send.OkAsync(ApiResponse<string>.Ok("Order completed."), ct);
    }
}
