using System.Collections.Concurrent;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevMeet.Shared.Events;

public interface IDomainEvent
{
    DateTimeOffset OccurredOnUtc { get; }
}

public interface IHasDomainEvents
{
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}

public interface IDomainEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task HandleAsync(TEvent domainEvent, CancellationToken ct = default);
}

public interface IDomainEventDispatcher
{
    Task DispatchAndClearAsync(DbContext dbContext, CancellationToken ct = default);
}

public sealed class DomainEventDispatcher(IServiceProvider serviceProvider) : IDomainEventDispatcher
{
    private static readonly ConcurrentDictionary<Type, MethodInfo> HandleMethodCache = new();

    public async Task DispatchAndClearAsync(DbContext dbContext, CancellationToken ct = default)
    {
        var entities = dbContext.ChangeTracker
            .Entries<IHasDomainEvents>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        if (entities.Count == 0) return;

        var events = entities.SelectMany(e => e.DomainEvents).ToList();
        foreach (var entity in entities)
            entity.ClearDomainEvents();

        foreach (var domainEvent in events)
        {
            var eventType = domainEvent.GetType();
            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(eventType);
            var handlers = serviceProvider.GetServices(handlerType);

            var handleMethod = HandleMethodCache.GetOrAdd(eventType, t =>
                typeof(IDomainEventHandler<>).MakeGenericType(t).GetMethod(nameof(IDomainEventHandler<IDomainEvent>.HandleAsync))!);

            foreach (var handler in handlers)
            {
                if (handler is null) continue;
                var task = (Task)handleMethod.Invoke(handler, [domainEvent, ct])!;
                await task;
            }
        }
    }
}
