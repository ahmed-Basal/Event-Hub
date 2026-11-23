using Domain.Common;

namespace Domain.Events;

public sealed record TicketOrderCreatedEvent(
    string OrderId,
    string ActivityId,
    string UserId,
    decimal Amount,
    string Currency) : DomainEvent;

public sealed record TicketOrderPaidEvent(
    string OrderId,
    string ActivityId,
    string UserId,
    decimal Amount,
    string Currency,
    string? PaymentIntentId) : DomainEvent;

public sealed record TicketOrderFailedEvent(
    string OrderId,
    string ActivityId,
    string UserId) : DomainEvent;

public sealed record TicketOrderRefundedEvent(
    string OrderId,
    string ActivityId,
    string UserId,
    decimal Amount,
    string Currency) : DomainEvent;
