namespace Core.Domain.Common;

/// <summary>
/// Generic base entity supporting strongly-typed or primitive keys,
/// with auditing timestamps.
/// </summary>
/// <typeparam name="TKey">The type of the entity identifier.</typeparam>
public abstract class BaseEntity<TKey>
{
    public virtual TKey Id { get; set; } = default!;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? LastModifiedUtc { get; set; }
}

/// <summary>
/// Default base entity with a string-based GUID identifier.
/// </summary>
public abstract class BaseEntity : BaseEntity<string>
{
    protected BaseEntity()
    {
        Id = Guid.NewGuid().ToString();
    }
}
