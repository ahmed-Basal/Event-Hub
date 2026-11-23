using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Payments.Commands.RefundOrder;

public class RefundOrderCommand : IRequest<Response<Unit>>
{
    public required string OrderId { get; set; }
}

public class RefundOrderCommandHandler(
    IAppDbContext dbContext,
    IPaymentService paymentService,
    ILogger<RefundOrderCommandHandler> logger)
    : ResponseHandler, IRequestHandler<RefundOrderCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(
        RefundOrderCommand request,
        CancellationToken cancellationToken)
    {
        var order = await dbContext.TicketOrders
            .Include(o => o.Activity)
            .ThenInclude(a => a.Attendees)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            return NotFound<Unit>("Order not found.");
        }

        if (order.Status != PaymentStatus.Paid)
        {
            return BadRequest<Unit>("Only paid orders can be refunded.");
        }

        var refunded = await paymentService.RefundAsync(order.StripePaymentIntentId, cancellationToken);
        if (!refunded)
        {
            logger.LogWarning("Stripe refund failed for Order {OrderId} (PaymentIntent {PaymentIntentId})",
                order.Id, order.StripePaymentIntentId);
            return BadRequest<Unit>("Stripe refund failed.");
        }

        order.MarkRefunded();
        order.Activity.RemoveAttendee(order.UserId, raiseEvent: false);

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Order {OrderId} refunded successfully for User {UserId} and Activity {ActivityId}",
            order.Id, order.UserId, order.ActivityId);

        return Success(Unit.Value, "Order refunded successfully.");
    }
}
