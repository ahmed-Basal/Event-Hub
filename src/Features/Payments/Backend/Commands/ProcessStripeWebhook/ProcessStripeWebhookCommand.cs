using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Feature.Payments.Commands.ProcessStripeWebhook;

public class ProcessStripeWebhookCommand : IRequest<Response<Unit>>
{
    public required string Payload { get; set; }
    public required string StripeSignature { get; set; }
}

public class ProcessStripeWebhookCommandHandler(
    IAppDbContext dbContext,
    IPaymentService paymentService,
    ILogger<ProcessStripeWebhookCommandHandler> logger)
    : ResponseHandler, IRequestHandler<ProcessStripeWebhookCommand, Response<Unit>>
{
    public async Task<Response<Unit>> Handle(
        ProcessStripeWebhookCommand request,
        CancellationToken cancellationToken)
    {
        var parsed = paymentService.VerifyAndParseWebhook(request.Payload, request.StripeSignature);
        if (!parsed.IsValid)
        {
            logger.LogWarning("Invalid Stripe webhook signature: {Error}", parsed.ErrorMessage);
            return BadRequest<Unit>(parsed.ErrorMessage ?? "Invalid webhook signature.");
        }

        if (!string.IsNullOrWhiteSpace(parsed.EventId))
        {
            var alreadyProcessed = await dbContext.ProcessedWebhookEvents
                .AsNoTracking()
                .AnyAsync(e => e.EventId == parsed.EventId, cancellationToken);

            if (alreadyProcessed)
            {
                logger.LogInformation(
                    "Duplicate Stripe webhook event {EventId} ({EventType}) ignored.",
                    parsed.EventId, parsed.EventType);
                return Success(Unit.Value);
            }

            dbContext.ProcessedWebhookEvents.Add(
                ProcessedWebhookEvent.Create(parsed.EventId, parsed.EventType, parsed.OrderId));
        }

        if (!string.IsNullOrWhiteSpace(parsed.OrderId))
        {
            if (parsed.EventType == "checkout.session.completed")
            {
                var order = await dbContext.TicketOrders
                    .Include(o => o.Activity)
                    .ThenInclude(a => a.Attendees)
                    .FirstOrDefaultAsync(o => o.Id == parsed.OrderId, cancellationToken);

                if (order is not null && order.Status == PaymentStatus.Pending)
                {
                    order.MarkPaid(parsed.PaymentIntentId);
                    order.Activity.AddAttendee(order.UserId, isHost: false, raiseEvent: false);

                    logger.LogInformation(
                        "Stripe webhook {EventId} fulfilled Order {OrderId} (PaymentIntent {PaymentIntentId})",
                        parsed.EventId, order.Id, parsed.PaymentIntentId);
                }
            }
            else if (parsed.EventType == "payment_intent.payment_failed")
            {
                var failedOrder = await dbContext.TicketOrders
                    .FirstOrDefaultAsync(o => o.Id == parsed.OrderId, cancellationToken);

                if (failedOrder is not null && failedOrder.Status == PaymentStatus.Pending)
                {
                    failedOrder.MarkFailed();
                    logger.LogWarning(
                        "Stripe webhook {EventId} marked Order {OrderId} as Failed.",
                        parsed.EventId, failedOrder.Id);
                }
            }
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" })
        {
            logger.LogInformation(
                "Concurrent duplicate Stripe webhook event {EventId} ({EventType}) ignored via unique constraint.",
                parsed.EventId, parsed.EventType);
            return Success(Unit.Value);
        }

        return Success(Unit.Value);
    }
}
