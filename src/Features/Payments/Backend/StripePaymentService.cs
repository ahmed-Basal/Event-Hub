using System.Diagnostics;
using Application.Interfaces;
using Application.Observability;
using Domain;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using Activity = Domain.Activity;

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
        using var activitySpan = DevMeetTelemetry.ActivitySource.StartActivity("Stripe: CreateCheckoutSession", ActivityKind.Client);
        activitySpan?.SetTag("dependency.name", "stripe");
        activitySpan?.SetTag("payment.currency", activity.Currency);

        if (!IsStripeConfigured)
        {
            activitySpan?.SetTag("payment.mode", "sandbox");
            var sandboxSessionId = $"cs_sandbox_{order.Id}";
            var sep = successUrl.Contains('?') ? '&' : '?';
            var sandboxUrl = $"{successUrl}{sep}orderId={Uri.EscapeDataString(order.Id)}&sandbox=true";
            DevMeetTelemetry.TicketOrdersCreatedTotal.Add(1, new KeyValuePair<string, object?>("currency", order.Currency));
            return new CheckoutSessionResult(order.Id, sandboxSessionId, sandboxUrl, IsSandbox: true);
        }

        activitySpan?.SetTag("payment.mode", "stripe");
        var sw = Stopwatch.StartNew();
        var outcome = "success";
        try
        {
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
            DevMeetTelemetry.TicketOrdersCreatedTotal.Add(1, new KeyValuePair<string, object?>("currency", order.Currency));
            activitySpan?.SetStatus(ActivityStatusCode.Ok);
            return new CheckoutSessionResult(order.Id, session.Id, session.Url, IsSandbox: false);
        }
        catch (Exception ex)
        {
            outcome = "failure";
            DevMeetTelemetry.RecordException(activitySpan, ex);
            throw;
        }
        finally
        {
            sw.Stop();
            var tags = new TagList { { "dependency", "stripe" }, { "operation", "create_checkout" }, { "outcome", outcome } };
            DevMeetTelemetry.DependencyCallsTotal.Add(1, tags);
            DevMeetTelemetry.DependencyDurationMs.Record(sw.Elapsed.TotalMilliseconds, tags);
        }
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
