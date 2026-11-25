namespace DevMeet.Shared.Seeding;

/// <summary>
/// Implemented by each module to seed its own tables idempotently in deterministic order.
/// </summary>
public interface IModuleSeeder
{
    int Order { get; }
    Task SeedAsync(CancellationToken ct = default);
}
