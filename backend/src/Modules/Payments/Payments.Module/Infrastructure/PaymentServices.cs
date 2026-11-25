using Activities.Contracts;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Payments.Contracts;
using Payments.Module.Domain;
using Stripe;
using Stripe.Checkout;

namespace Payments.Module.Infrastructure;

public sealed class StripeSettings
{
    public const string SectionName = "Stripe";
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
}

public sealed record CheckoutSessionResult(
    string OrderId,
    string SessionId,
    string CheckoutUrl,
    bool IsSandbox);

public sealed record WebhookParseResult(
    bool IsValid,
    string EventId,
    string EventType,
    string? OrderId,
    string? SessionId,
    string? PaymentIntentId);

public interface IPaymentService
{
    bool IsStripeConfigured { get; }
    Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
        TicketOrder order,
        ActivitySummary activity,
        UserSummary user,
        string successUrl,
        string cancelUrl,
        CancellationToken ct = default);
    WebhookParseResult ParseWebhook(string jsonPayload, string stripeSignature);
    Task<bool> RefundPaymentAsync(string paymentIntentId, CancellationToken ct = default);
}

public sealed class StripePaymentService(IOptions<StripeSettings> options) : IPaymentService
{
    private readonly StripeSettings _settings = options.Value;
    public bool IsStripeConfigured => !string.IsNullOrWhiteSpace(_settings.SecretKey);

    public async Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
        TicketOrder order,
        ActivitySummary activity,
        UserSummary user,
        string successUrl,
        string cancelUrl,
        CancellationToken ct = default)
    {
        if (!IsStripeConfigured)
        {
            var sandboxSessionId = $"cs_sandbox_{order.Id}";
            var sep = successUrl.Contains('?') ? '&' : '?';
            var sandboxUrl = $"{successUrl}{sep}orderId={Uri.EscapeDataString(order.Id)}&sandbox=true";
            return new CheckoutSessionResult(order.Id, sandboxSessionId, sandboxUrl, IsSandbox: true);
        }

        StripeConfiguration.ApiKey = _settings.SecretKey;
        var sessionOptions = new SessionCreateOptions
        {
            Mode = "payment",
            CustomerEmail = user.Email,
            SuccessUrl = $"{successUrl}?orderId={Uri.EscapeDataString(order.Id)}&session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id,
                ["activityId"] = activity.Id,
                ["userId"] = user.Id
            },
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = string.IsNullOrWhiteSpace(activity.Currency) ? "usd" : activity.Currency.ToLowerInvariant(),
                        UnitAmount = (long)(activity.Price * 100m),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = activity.Title,
                            Description = $"{activity.Venue}, {activity.City}"
                        }
                    }
                }
            ]
        };

        var service = new SessionService();
        var session = await service.CreateAsync(sessionOptions, cancellationToken: ct);
        return new CheckoutSessionResult(order.Id, session.Id, session.Url, IsSandbox: false);
    }

    public WebhookParseResult ParseWebhook(string jsonPayload, string stripeSignature)
    {
        if (string.IsNullOrWhiteSpace(_settings.WebhookSecret))
            return new WebhookParseResult(false, "", "", null, null, null);

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(jsonPayload, stripeSignature, _settings.WebhookSecret);
            if (stripeEvent.Data.Object is Session session)
            {
                session.Metadata.TryGetValue("orderId", out var orderId);
                return new WebhookParseResult(true, stripeEvent.Id, stripeEvent.Type, orderId, session.Id, session.PaymentIntentId);
            }
            return new WebhookParseResult(true, stripeEvent.Id, stripeEvent.Type, null, null, null);
        }
        catch (StripeException)
        {
            return new WebhookParseResult(false, "", "", null, null, null);
        }
    }

    public async Task<bool> RefundPaymentAsync(string paymentIntentId, CancellationToken ct = default)
    {
        if (!IsStripeConfigured || string.IsNullOrWhiteSpace(paymentIntentId))
            return true;

        StripeConfiguration.ApiKey = _settings.SecretKey;
        var service = new RefundService();
        var refund = await service.CreateAsync(new RefundCreateOptions { PaymentIntent = paymentIntentId }, cancellationToken: ct);
        return refund.Status == "succeeded";
    }
}

public sealed class PaymentsDirectory(PaymentsDbContext db) : IPaymentsDirectory
{
    public async Task<IReadOnlyList<OrderSummaryDto>> GetAllOrderSummariesAsync(CancellationToken ct = default)
    {
        return await db.TicketOrders.AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.ActivityId,
                o.UserId,
                o.Amount,
                o.Currency,
                o.Status.ToString(),
                o.CreatedAt,
                o.PaidAt))
            .ToListAsync(ct);
    }
}
