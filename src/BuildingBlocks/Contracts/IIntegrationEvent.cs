using MediatR;

namespace BuildingBlocks.Contracts;

/// <summary>
/// Marker contract for cross-module integration events dispatched via the Transactional Outbox.
/// </summary>
public interface IIntegrationEvent : INotification
{
    Guid EventId { get; }
    DateTimeOffset OccurredOnUtc { get; }
}
