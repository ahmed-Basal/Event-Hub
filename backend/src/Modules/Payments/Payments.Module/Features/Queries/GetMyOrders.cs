using Activities.Contracts;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Queries;

public sealed record MyOrderDto(
    string Id,
    string ActivityId,
    string ActivityTitle,
    decimal Amount,
    string Currency,
    string Status,
    string? CheckInCode,
    DateTimeOffset? CheckedInAtUtc,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PaidAt);

public sealed class GetMyOrdersEndpoint(
    PaymentsDbContext db,
    IActivitiesDirectory activities,
    ICurrentUser currentUser)
    : EndpointWithoutRequest<ApiResponse<List<MyOrderDto>>>
{
    public override void Configure()
    {
        Get("/api/payments/my-orders");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var orders = await db.TicketOrders.AsNoTracking()
            .Where(o => o.UserId == currentUser.UserId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

        var activityLookup = await activities.GetByIdsAsync(orders.Select(o => o.ActivityId), ct);

        var result = orders.Select(o =>
        {
            activityLookup.TryGetValue(o.ActivityId, out var act);
            return new MyOrderDto(
                o.Id,
                o.ActivityId,
                act?.Title ?? "Activity",
                o.Amount,
                o.Currency,
                o.Status.ToString(),
                o.CheckInCode,
                o.CheckedInAtUtc,
                o.CreatedAt,
                o.PaidAt);
        }).ToList();

        await Send.OkAsync(ApiResponse<List<MyOrderDto>>.Ok(result), ct);
    }
}
