namespace Domain;

public sealed class IdempotencyRecord
{
    private IdempotencyRecord() { }

    public string ScopeKey { get; private set; } = string.Empty;
    public int StatusCode { get; private set; }
    public string ResponseJson { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset ExpiresAtUtc { get; private set; }

    public static IdempotencyRecord Create(string scopeKey, int statusCode, string responseJson, TimeSpan ttl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(scopeKey, nameof(scopeKey));
        var now = DateTimeOffset.UtcNow;
        return new IdempotencyRecord
        {
            ScopeKey = scopeKey.Trim(),
            StatusCode = statusCode,
            ResponseJson = responseJson,
            CreatedAtUtc = now,
            ExpiresAtUtc = now.Add(ttl)
        };
    }
}
