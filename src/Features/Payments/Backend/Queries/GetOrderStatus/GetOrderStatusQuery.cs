using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Payments.Queries.GetOrderStatus;

public record OrderStatusDto(
    string OrderId,
    string ActivityId,
    string Status,
    bool IsPaid,
    DateTimeOffset? PaidAt);

public class GetOrderStatusQuery : IRequest<Response<OrderStatusDto>>
{
    public required string OrderId { get; set; }
}

public class GetOrderStatusQueryHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<GetOrderStatusQuery, Response<OrderStatusDto>>
{
    public async Task<Response<OrderStatusDto>> Handle(
        GetOrderStatusQuery request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();
        var order = await dbContext.TicketOrders
            .AsNoTracking()
            .Where(o => o.Id == request.OrderId && o.UserId == userId)
            .Select(o => new OrderStatusDto(
                o.Id,
                o.ActivityId,
                o.Status.ToString(),
                o.Status == PaymentStatus.Paid,
                o.PaidAt))
            .FirstOrDefaultAsync(cancellationToken);

        return order is null
            ? NotFound<OrderStatusDto>("Order not found.")
            : Success(order);
    }
}
