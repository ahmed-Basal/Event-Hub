using Domain;

namespace Application.Interfaces;

public record CheckoutSessionResult(
    string OrderId,
    string SessionId,
    string CheckoutUrl,
    bool IsSandbox);

public record WebhookParseResult(
    bool IsValid,
    string EventId,
    string EventType,
    string? OrderId,
    string? PaymentIntentId,
    string? ErrorMessage = null);

public interface IPaymentService
{
    bool IsStripeConfigured { get; }
    Task<CheckoutSessionResult> CreateCheckoutSessionAsync(
        TicketOrder order,
        Activity activity,
        User user,
        string successUrl,
        string cancelUrl,
        CancellationToken ct = default);
    WebhookParseResult VerifyAndParseWebhook(string jsonPayload, string stripeSignature);
    Task<bool> RefundAsync(string? paymentIntentId, CancellationToken ct = default);
}
