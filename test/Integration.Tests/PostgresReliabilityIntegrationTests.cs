using Domain;
using Domain.Events;
using Infrastructure.Data;
using Infrastructure.Outbox;
using Infrastructure.Payments;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Testcontainers.PostgreSql;

namespace Integration.Tests;

[Trait("Category", "Integration")]
public sealed class PostgresReliabilityIntegrationTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("devmeet_test")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    private DevMeetDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<DevMeetDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;
        return new DevMeetDbContext(options);
    }

    [Fact]
    public async Task PostgresIdempotencyStore_ShouldPersistAndReplayAcrossScopes()
    {
        var scopeKey = $"idempotency:payment:user1:/api/payments/checkout/act1:{Guid.NewGuid()}";

        await using (var db1 = CreateDbContext())
        {
            var store1 = new PostgresIdempotencyStore(db1);
            await store1.SaveAsync(scopeKey, 200, "{\"orderId\":\"ord-1\"}", TimeSpan.FromMinutes(30));
        }

        await using (var db2 = CreateDbContext())
        {
            var store2 = new PostgresIdempotencyStore(db2);
            var cached = await store2.GetAsync(scopeKey);
            Assert.NotNull(cached);
            Assert.Equal(200, cached.StatusCode);
            Assert.Contains("ord-1", cached.ResponseJson);
        }
    }

    [Fact]
    public async Task OutboxProcessor_ShouldClaimAndProcessOnce_AcrossRealPostgres()
    {
        var evt = new TicketOrderFailedEvent("ord-pg-1", "act-1", "user-1");

        await using (var seedDb = CreateDbContext())
        {
            seedDb.OutboxMessages.Add(OutboxMessage.FromDomainEvent(evt));
            await seedDb.SaveChangesAsync();
        }

        var services = new ServiceCollection();
        services.AddDbContext<DevMeetDbContext>(opt => opt.UseNpgsql(_postgres.GetConnectionString()));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<OutboxProcessor>());
        await using var provider = services.BuildServiceProvider();

        var processor = new OutboxProcessor(
            provider.GetRequiredService<IServiceScopeFactory>(),
            new OutboxWakeup(),
            NullLogger<OutboxProcessor>.Instance);

        var processedFirst = await processor.ProcessBatchAsync(CancellationToken.None);
        var processedSecond = await processor.ProcessBatchAsync(CancellationToken.None);

        Assert.Equal(1, processedFirst);
        Assert.Equal(0, processedSecond);

        await using var verifyDb = CreateDbContext();
        var msg = await verifyDb.OutboxMessages.SingleAsync(m => m.Id == evt.EventId);
        Assert.Equal(OutboxStatus.Processed, msg.Status);
        Assert.Null(msg.ClaimedBy);
        Assert.NotNull(msg.ProcessedOnUtc);
    }

    [Fact]
    public async Task ProcessedWebhookEvents_ShouldRejectDuplicateEventId()
    {
        var eventId = $"evt_{Guid.NewGuid():N}";

        await using (var db1 = CreateDbContext())
        {
            db1.ProcessedWebhookEvents.Add(ProcessedWebhookEvent.Create(eventId, "checkout.session.completed", "ord-1"));
            await db1.SaveChangesAsync();
        }

        await using (var db2 = CreateDbContext())
        {
            db2.ProcessedWebhookEvents.Add(ProcessedWebhookEvent.Create(eventId, "checkout.session.completed", "ord-1"));
            var ex = await Assert.ThrowsAsync<DbUpdateException>(() => db2.SaveChangesAsync());
            var pgEx = Assert.IsType<Npgsql.PostgresException>(ex.InnerException);
            Assert.Equal("23505", pgEx.SqlState);
        }
    }
}
