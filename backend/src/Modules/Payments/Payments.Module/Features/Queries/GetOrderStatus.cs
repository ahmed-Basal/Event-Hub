using System.Net;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Queries;

public sealed class GetOrderStatusRequest
{
    public string OrderId { get; init; } = string.Empty;
}

public sealed record OrderStatusDto(
    string Id,
    string ActivityId,
    string Status,
    string? CheckInCode,
    DateTimeOffset? PaidAt);

public sealed class GetOrderStatusEndpoint(PaymentsDbContext db, ICurrentUser currentUser)
    : Endpoint<GetOrderStatusRequest, ApiResponse<OrderStatusDto>>
{
    public override void Configure()
    {
        Get("/api/payments/orders/{orderId}/status");
    }

    public override async Task HandleAsync(GetOrderStatusRequest req, CancellationToken ct)
    {
        var order = await db.TicketOrders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == req.OrderId && o.UserId == currentUser.UserId, ct);

        if (order is null)
        {
            await Send.ResponseAsync(ApiResponse<OrderStatusDto>.Fail(HttpStatusCode.NotFound, "Order not found."), 404, ct);
            return;
        }

        await Send.OkAsync(ApiResponse<OrderStatusDto>.Ok(
            new OrderStatusDto(order.Id, order.ActivityId, order.Status.ToString(), order.CheckInCode, order.PaidAt)), ct);
    }
}
