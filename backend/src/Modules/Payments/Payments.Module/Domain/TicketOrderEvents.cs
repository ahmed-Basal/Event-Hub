using DevMeet.Shared.Events;

namespace Payments.Module.Domain;

public sealed record TicketOrderCreatedEvent(string OrderId, string ActivityId, string UserId, decimal Amount, string Currency) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record TicketOrderPaidEvent(
    string OrderId,
    string ActivityId,
    string UserId,
    decimal Amount,
    string Currency,
    string? PaymentIntentId,
    string CheckInCode) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record TicketOrderFailedEvent(string OrderId, string ActivityId, string UserId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record TicketOrderRefundedEvent(string OrderId, string ActivityId, string UserId, decimal Amount, string Currency) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}

public sealed record TicketCheckedInEvent(string OrderId, string ActivityId, string UserId, string CheckedInByUserId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
