namespace Core.Domain.Common;

/// <summary>
/// Abstract generic auditable entity extending BaseEntity<TKey> with audit timestamps and tracking properties.
/// Adheres to Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).
/// </summary>
/// <typeparam name="TKey">The type of the entity identifier.</typeparam>
public abstract class AuditableEntity<TKey> : BaseEntity<TKey>
{
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public string? CreatedBy { get; set; }

    public DateTimeOffset? LastModifiedUtc { get; set; }

    public string? LastModifiedBy { get; set; }
}

/// <summary>
/// Default string-based abstract auditable entity.
/// Inherits from AuditableEntity<string> and provides default GUID initialization.
/// </summary>
public abstract class AuditableEntity : AuditableEntity<string>
{
    protected AuditableEntity()
    {
        Id = Guid.NewGuid().ToString();
    }

    protected AuditableEntity(string id)
    {
        Id = id;
    }
}

/// <summary>
/// Abstract generic AuditEntity alias inheriting from AuditableEntity<TKey>.
/// </summary>
/// <typeparam name="TKey">The type of the entity identifier.</typeparam>
public abstract class AuditEntity<TKey> : AuditableEntity<TKey>
{
}

/// <summary>
/// Abstract AuditEntity default string-based alias inheriting from AuditableEntity.
/// </summary>
public abstract class AuditEntity : AuditableEntity
{
    protected AuditEntity() : base() { }

    protected AuditEntity(string id) : base(id) { }
}

