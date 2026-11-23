using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Payments.Commands.SandboxCompleteOrder;

public class SandboxCompleteOrderCommand : IRequest<Response<Unit>>
{
    public required string OrderId { get; set; }
}

public class SandboxCompleteOrderCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor,
    ILogger<SandboxCompleteOrderCommandHandler> logger)
    : ResponseHandler, IRequestHandler<SandboxCompleteOrderCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(
        SandboxCompleteOrderCommand request,
        CancellationToken cancellationToken)
    {
        var userId = userAccessor.GetUserId();

        var order = await dbContext.TicketOrders
            .Include(o => o.Activity)
            .ThenInclude(a => a.Attendees)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
            return NotFound<Unit>("Order not found.");

        if (order.UserId != userId)
            return Unauthorized<Unit>("You do not own this order.");

        if (order.Status == PaymentStatus.Paid)
            return Success(Unit.Value, "Order already paid.");

        if (order.Status != PaymentStatus.Pending)
            return BadRequest<Unit>($"Order cannot be completed from status '{order.Status}'.");

        var sandboxIntent = $"pi_sandbox_{order.Id[..Math.Min(8, order.Id.Length)]}";
        order.MarkPaid(sandboxIntent);
        order.Activity.AddAttendee(order.UserId, isHost: false, raiseEvent: false);

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Sandbox payment completed for Order {OrderId} by User {UserId}",
            order.Id, userId);

        return Success(Unit.Value, "Sandbox payment webhook processed!");
    }
}
