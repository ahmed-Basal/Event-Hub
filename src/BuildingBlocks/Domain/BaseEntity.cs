using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Domain.Common;

/// <summary>
/// Abstract root base entity contract with domain event support.
/// </summary>
public abstract class BaseEntity : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        _domainEvents.Add(domainEvent);
    }

    protected void RemoveDomainEvent(IDomainEvent domainEvent) => _domainEvents.Remove(domainEvent);

    public void ClearDomainEvents() => _domainEvents.Clear();
}

/// <summary>
/// Abstract generic base entity providing the primary key identity contract.
/// Adheres to Single Responsibility Principle (SRP).
/// </summary>
/// <typeparam name="TKey">The type of the entity identifier.</typeparam>
public abstract class BaseEntity<TKey> : BaseEntity
{
    public virtual TKey Id { get; set; } = default!;
}
