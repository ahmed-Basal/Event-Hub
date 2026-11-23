using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Payments.Commands.CreateCheckout;

public class CreateCheckoutCommand : IRequest<Response<CheckoutSessionResult>>
{
    public required string ActivityId { get; set; }
}

public class CreateCheckoutCommandHandler(
    IAppDbContext dbContext,
    IUserAccessor userAccessor,
    IPaymentService paymentService,
    IConfiguration configuration,
    ILogger<CreateCheckoutCommandHandler> logger)
    : ResponseHandler, IRequestHandler<CreateCheckoutCommand, Response<CheckoutSessionResult>>
{
    public async Task<Response<CheckoutSessionResult>> Handle(
        CreateCheckoutCommand request,
        CancellationToken cancellationToken)
    {
        var activity = await dbContext.Activities
            .Include(a => a.Attendees)
            .FirstOrDefaultAsync(
                a => a.Id == request.ActivityId || a.Slug == request.ActivityId,
                cancellationToken);

        if (activity is null)
            return NotFound<CheckoutSessionResult>("Activity not found.");

        if (activity.IsCancelled)
            return BadRequest<CheckoutSessionResult>("Cannot buy ticket for a cancelled activity.");

        if (activity.Price <= 0)
            return BadRequest<CheckoutSessionResult>("This event is free — use RSVP directly.");

        var user = await userAccessor.GetUserAsync();
        if (activity.Attendees.Any(a => a.UserId == user.Id))
        {
            return BadRequest<CheckoutSessionResult>("You are already registered for this event.");
        }

        var order = TicketOrder.Create(activity.ID, user.Id, activity.Price, activity.Currency);

        var clientUrl = (configuration["ClientAppUrl"] ?? "http://localhost:3000").TrimEnd('/');
        var successUrl = $"{clientUrl}/payment/success";
        var cancelUrl = $"{clientUrl}/activities/{activity.ID}";

        var session = await paymentService.CreateCheckoutSessionAsync(
            order, activity, user, successUrl, cancelUrl, cancellationToken);

        order.AttachStripeSession(session.SessionId);
        dbContext.TicketOrders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Checkout session {SessionId} created for Order {OrderId} (Activity {ActivityId}, User {UserId}, Amount {Amount} {Currency}, Sandbox={IsSandbox})",
            session.SessionId, order.Id, activity.ID, user.Id, order.Amount, order.Currency, session.IsSandbox);

        return Success(session);
    }
}
