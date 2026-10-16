namespace Core.Domain.Common;

/// <summary>
/// Abstract root base entity contract.
/// </summary>
public abstract class BaseEntity
{
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
