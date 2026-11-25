using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using DevMeet.Shared.Events;

namespace Payments.Module.Domain;

public sealed class TicketOrder : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private TicketOrder() { }

    public string Id { get; private set; } = string.Empty;
    public string ActivityId { get; private set; } = string.Empty;
    public string UserId { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "usd";
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public string? StripeSessionId { get; private set; }
    public string? StripePaymentIntentId { get; private set; }
    public string? CheckInCode { get; private set; }
    public DateTimeOffset? CheckedInAtUtc { get; private set; }
    public string? CheckedInByUserId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PaidAt { get; private set; }

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public static TicketOrder Create(
        string activityId,
        string userId,
        decimal amount,
        string currency = "usd",
        string? id = null,
        DateTimeOffset? createdAt = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(activityId, nameof(activityId));
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Ticket order amount must be greater than zero.");

        var order = new TicketOrder
        {
            Id = string.IsNullOrWhiteSpace(id) ? Guid.NewGuid().ToString() : id.Trim(),
            ActivityId = activityId.Trim(),
            UserId = userId.Trim(),
            Amount = amount,
            Currency = string.IsNullOrWhiteSpace(currency) ? "usd" : currency.Trim().ToLowerInvariant(),
            Status = PaymentStatus.Pending,
            CreatedAt = createdAt?.ToUniversalTime() ?? DateTimeOffset.UtcNow
        };

        order._domainEvents.Add(new TicketOrderCreatedEvent(order.Id, order.ActivityId, order.UserId, order.Amount, order.Currency));
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
            throw new InvalidOperationException($"Cannot mark ticket order in '{Status}' status as Paid.");

        Status = PaymentStatus.Paid;
        StripePaymentIntentId = string.IsNullOrWhiteSpace(paymentIntentId)
            ? StripePaymentIntentId
            : paymentIntentId.Trim();
        PaidAt = DateTimeOffset.UtcNow;
        CheckInCode ??= $"DEVMEET-{Convert.ToHexString(RandomNumberGenerator.GetBytes(6))}";

        _domainEvents.Add(new TicketOrderPaidEvent(Id, ActivityId, UserId, Amount, Currency, StripePaymentIntentId, CheckInCode));
    }

    public void CheckIn(string checkedInByUserId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(checkedInByUserId, nameof(checkedInByUserId));

        if (Status != PaymentStatus.Paid)
            throw new InvalidOperationException("Only paid tickets can be checked in.");

        if (CheckedInAtUtc.HasValue)
            throw new InvalidOperationException("This ticket has already been checked in.");

        CheckedInAtUtc = DateTimeOffset.UtcNow;
        CheckedInByUserId = checkedInByUserId.Trim();

        _domainEvents.Add(new TicketCheckedInEvent(Id, ActivityId, UserId, CheckedInByUserId));
    }

    public void MarkFailed()
    {
        if (Status != PaymentStatus.Pending) return;
        Status = PaymentStatus.Failed;
        _domainEvents.Add(new TicketOrderFailedEvent(Id, ActivityId, UserId));
    }

    public void MarkRefunded()
    {
        if (Status != PaymentStatus.Paid)
            throw new InvalidOperationException("Only paid orders can be refunded.");

        Status = PaymentStatus.Refunded;
        _domainEvents.Add(new TicketOrderRefundedEvent(Id, ActivityId, UserId, Amount, Currency));
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
}
