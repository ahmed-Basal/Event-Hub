using Domain.Common;
using MediatR;

namespace Application.Common.Events;

/// <summary>
/// MediatR notification wrapper that bridges pure Domain events into Application event handlers.
/// </summary>
public sealed record DomainEventNotification<TDomainEvent>(TDomainEvent DomainEvent) : INotification
    where TDomainEvent : IDomainEvent;
