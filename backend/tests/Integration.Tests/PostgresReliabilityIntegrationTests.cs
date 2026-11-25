using Activities.Module.Domain;
using Activities.Module.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Domain;
using Payments.Module.Infrastructure;
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

        await using var payDb = CreatePaymentsDbContext();
        await payDb.Database.EnsureCreatedAsync();

        await using var actDb = CreateActivitiesDbContext();
        await actDb.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    private PaymentsDbContext CreatePaymentsDbContext()
    {
        var options = new DbContextOptionsBuilder<PaymentsDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;
        return new PaymentsDbContext(options);
    }

    private ActivitiesDbContext CreateActivitiesDbContext()
    {
        var options = new DbContextOptionsBuilder<ActivitiesDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;
        return new ActivitiesDbContext(options);
    }

    [Fact]
    public async Task ProcessedWebhookEvents_ShouldRejectDuplicateEventId()
    {
        var eventId = $"evt_{Guid.NewGuid():N}";

        await using (var db1 = CreatePaymentsDbContext())
        {
            db1.ProcessedWebhookEvents.Add(ProcessedWebhookEvent.Create(eventId, "checkout.session.completed", "ord-1"));
            await db1.SaveChangesAsync();
        }

        await using (var db2 = CreatePaymentsDbContext())
        {
            db2.ProcessedWebhookEvents.Add(ProcessedWebhookEvent.Create(eventId, "checkout.session.completed", "ord-1"));
            var ex = await Assert.ThrowsAsync<DbUpdateException>(() => db2.SaveChangesAsync());
            var pgEx = Assert.IsType<Npgsql.PostgresException>(ex.InnerException);
            Assert.Equal("23505", pgEx.SqlState);
        }
    }

    [Fact]
    public async Task IdempotencyRecords_ShouldPersistAndRetrieveByScopeKey()
    {
        var scopeKey = $"checkout:user1:act1:{Guid.NewGuid()}";

        await using (var db1 = CreatePaymentsDbContext())
        {
            db1.IdempotencyRecords.Add(IdempotencyRecord.Create(scopeKey, 200, "{\"orderId\":\"ord-1\"}", TimeSpan.FromMinutes(30)));
            await db1.SaveChangesAsync();
        }

        await using (var db2 = CreatePaymentsDbContext())
        {
            var cached = await db2.IdempotencyRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.ScopeKey == scopeKey);
            Assert.NotNull(cached);
            Assert.Equal(200, cached.StatusCode);
            Assert.Contains("ord-1", cached.ResponseJson);
        }
    }

    [Fact]
    public async Task Activity_WaitlistPromotion_ShouldPersistAcrossScopes()
    {
        var actId = $"act-{Guid.NewGuid():N}";

        await using (var db1 = CreateActivitiesDbContext())
        {
            var act = Activity.Create("Capacity Event", "Desc", "backend", DateTimeOffset.UtcNow.AddDays(3), "Cairo", "Venue", 30.0, 31.0, id: actId, maxCapacity: 2);
            act.AddAttendee("host-1", isHost: true, raiseEvent: false);
            act.AddAttendee("user-2", isHost: false, raiseEvent: false);
            act.JoinWaitlist("user-3");
            db1.Activities.Add(act);
            await db1.SaveChangesAsync();
        }

        await using (var db2 = CreateActivitiesDbContext())
        {
            var act = await db2.Activities
                .Include(a => a.Attendees)
                .Include(a => a.Waitlist)
                .SingleAsync(a => a.Id == actId);

            act.RemoveAttendee("user-2");
            var promoted = act.PopNextWaitlistedUser();
            Assert.Equal("user-3", promoted);
            await db2.SaveChangesAsync();
        }

        await using (var db3 = CreateActivitiesDbContext())
        {
            var act = await db3.Activities
                .Include(a => a.Attendees)
                .Include(a => a.Waitlist)
                .SingleAsync(a => a.Id == actId);

            Assert.Contains(act.Attendees, a => a.UserId == "user-3");
            Assert.Empty(act.Waitlist);
        }
    }
}
