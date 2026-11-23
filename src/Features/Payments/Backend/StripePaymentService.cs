using Application.Interfaces;
using Domain;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace Infrastructure.Payments;

public class StripePaymentService(IOptions<StripeSettings> options) : IPaymentService
{
    private readonly StripeSettings _settings = options.Value;

    public bool IsStripeConfigured => !string.IsNullOrWhiteSpace(_settings.SecretKey);

    public async Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
        TicketOrder order,
        Activity activity,
        User user,
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
                ["activityId"] = activity.ID,
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

    public WebhookParseResult VerifyAndParseWebhook(string jsonPayload, string stripeSignature)
    {
        if (string.IsNullOrWhiteSpace(_settings.WebhookSecret))
        {
            return new WebhookParseResult(false, string.Empty, string.Empty, null, null, "Stripe WebhookSecret is not configured.");
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                jsonPayload,
                stripeSignature,
                _settings.WebhookSecret);

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted &&
                stripeEvent.Data.Object is Session session)
            {
                session.Metadata.TryGetValue("orderId", out var orderId);
                return new WebhookParseResult(true, stripeEvent.Id, stripeEvent.Type, orderId, session.PaymentIntentId);
            }

            if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed &&
                stripeEvent.Data.Object is PaymentIntent failedIntent)
            {
                failedIntent.Metadata.TryGetValue("orderId", out var orderId);
                return new WebhookParseResult(true, stripeEvent.Id, stripeEvent.Type, orderId, failedIntent.Id);
            }

            return new WebhookParseResult(true, stripeEvent.Id, stripeEvent.Type, null, null);
        }
        catch (StripeException ex)
        {
            return new WebhookParseResult(false, string.Empty, string.Empty, null, null, ex.Message);
        }
    }

    public async Task<bool> RefundAsync(string? paymentIntentId, CancellationToken ct = default)
    {
        if (!IsStripeConfigured ||
            string.IsNullOrWhiteSpace(paymentIntentId) ||
            paymentIntentId.StartsWith("pi_sandbox_", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        StripeConfiguration.ApiKey = _settings.SecretKey;
        var refundService = new RefundService();
        var refund = await refundService.CreateAsync(
            new RefundCreateOptions { PaymentIntent = paymentIntentId },
            cancellationToken: ct);

        return refund.Status is "succeeded" or "pending";
    }
}
