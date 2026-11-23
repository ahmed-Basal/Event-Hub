using Domain.Common;
using Domain.Events;

namespace Domain;

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Failed = 2,
    Refunded = 3
}

public sealed class TicketOrder : BaseEntity<string>
{
    private TicketOrder() { }

    public string ActivityId { get; private set; } = string.Empty;
    public Activity Activity { get; private set; } = null!;

    public string UserId { get; private set; } = string.Empty;
    public User User { get; private set; } = null!;

    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "usd";
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;

    public string? StripeSessionId { get; private set; }
    public string? StripePaymentIntentId { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PaidAt { get; private set; }

    public static TicketOrder Create(
        string activityId,
        string userId,
        decimal amount,
        string currency = "usd",
        string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(activityId, nameof(activityId));
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Ticket order amount must be greater than zero.");
        }

        var order = new TicketOrder
        {
            Id = string.IsNullOrWhiteSpace(id) ? Guid.NewGuid().ToString() : id.Trim(),
            ActivityId = activityId.Trim(),
            UserId = userId.Trim(),
            Amount = amount,
            Currency = string.IsNullOrWhiteSpace(currency) ? "usd" : currency.Trim().ToLowerInvariant(),
            Status = PaymentStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow
        };

        order.AddDomainEvent(new TicketOrderCreatedEvent(
            order.Id, order.ActivityId, order.UserId, order.Amount, order.Currency));

        return order;
    }

    public void AttachStripeSession(string sessionId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sessionId, nameof(sessionId));
        StripeSessionId = sessionId.Trim();
    }

    public void MarkPaid(string? paymentIntentId = null)
    {
        if (Status == PaymentStatus.Paid) return;
        if (Status != PaymentStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot mark ticket order in '{Status}' status as Paid.");
        }

        Status = PaymentStatus.Paid;
        StripePaymentIntentId = string.IsNullOrWhiteSpace(paymentIntentId)
            ? StripePaymentIntentId
            : paymentIntentId.Trim();
        PaidAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new TicketOrderPaidEvent(
            Id, ActivityId, UserId, Amount, Currency, StripePaymentIntentId));
    }

    public void MarkFailed()
    {
        if (Status != PaymentStatus.Pending) return;

        Status = PaymentStatus.Failed;
        AddDomainEvent(new TicketOrderFailedEvent(Id, ActivityId, UserId));
    }

    public void MarkRefunded()
    {
        if (Status != PaymentStatus.Paid)
        {
            throw new InvalidOperationException("Only paid orders can be refunded.");
        }

        Status = PaymentStatus.Refunded;
        AddDomainEvent(new TicketOrderRefundedEvent(Id, ActivityId, UserId, Amount, Currency));
    }
}
