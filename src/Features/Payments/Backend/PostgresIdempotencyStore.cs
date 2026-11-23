using BuildingBlocks.Contracts;
using Domain;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Payments;

public sealed class PostgresIdempotencyStore(DevMeetDbContext dbContext) : IIdempotencyStore
{
    public async Task<IdempotentResponse?> GetAsync(string scopeKey, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        var record = await dbContext.IdempotencyRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ScopeKey == scopeKey && x.ExpiresAtUtc > now, ct);

        return record is null
            ? null
            : new IdempotentResponse(record.StatusCode, record.ResponseJson);
    }

    public async Task SaveAsync(string scopeKey, int statusCode, string responseJson, TimeSpan ttl, CancellationToken ct = default)
    {
        var existing = await dbContext.IdempotencyRecords.FindAsync([scopeKey], ct);
        if (existing is not null)
        {
            return;
        }

        dbContext.IdempotencyRecords.Add(IdempotencyRecord.Create(scopeKey, statusCode, responseJson, ttl));
        try
        {
            await dbContext.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Concurrent request already persisted the same idempotency key.
        }
    }
}
