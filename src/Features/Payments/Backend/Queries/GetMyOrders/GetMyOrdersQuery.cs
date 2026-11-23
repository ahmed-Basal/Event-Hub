using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Payments.Queries.GetMyOrders;

public record OrderSummaryDto(
    string Id,
    string ActivityId,
    string ActivityTitle,
    decimal Amount,
    string Currency,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PaidAt);

public class GetMyOrdersQuery : IRequest<Response<List<OrderSummaryDto>>>;

public class GetMyOrdersQueryHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetMyOrdersQuery, Response<List<OrderSummaryDto>>>
{
    public async Task<Response<List<OrderSummaryDto>>> Handle(
        GetMyOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();
        var orders = await dbContext.TicketOrders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.ActivityId,
                o.Activity.Title,
                o.Amount,
                o.Currency,
                o.Status.ToString(),
                o.CreatedAt,
                o.PaidAt))
            .ToListAsync(cancellationToken);

        return Success(orders);
    }
}
