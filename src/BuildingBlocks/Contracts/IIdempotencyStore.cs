namespace BuildingBlocks.Contracts;

public sealed record IdempotentResponse(int StatusCode, string ResponseJson);

/// <summary>
/// Persistent idempotency store for payment and mutating endpoints across replicas and restarts.
/// </summary>
public interface IIdempotencyStore
{
    Task<IdempotentResponse?> GetAsync(string scopeKey, CancellationToken ct = default);
    Task SaveAsync(string scopeKey, int statusCode, string responseJson, TimeSpan ttl, CancellationToken ct = default);
}
