using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Payments.Module.Domain;

namespace Payments.Module.Infrastructure;

public sealed class PaymentsSeeder(PaymentsDbContext db, ILogger<PaymentsSeeder> logger) : IModuleSeeder
{
    public int Order => 5;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.TicketOrders.AnyAsync(ct))
            return;

        var paidOrder = TicketOrder.Create(
            activityId: SeedConstants.Activities.AiWorkshopId,
            userId: SeedConstants.Users.BobId,
            amount: 49.00m,
            currency: "usd",
            id: "ord-seed-paid-001",
            createdAt: DateTimeOffset.UtcNow.AddDays(-2));
        paidOrder.AttachStripeSession("cs_seed_paid_001");
        paidOrder.MarkPaid("pi_seed_paid_001");
        paidOrder.ClearDomainEvents();

        var stalePendingOrder = TicketOrder.Create(
            activityId: SeedConstants.Activities.CloudSummitId,
            userId: SeedConstants.Users.BobId,
            amount: 25.00m,
            currency: "usd",
            id: "ord-seed-stale-002",
            createdAt: DateTimeOffset.UtcNow.AddHours(-2));
        stalePendingOrder.AttachStripeSession("cs_seed_stale_002");
        stalePendingOrder.ClearDomainEvents();

        db.TicketOrders.AddRange(paidOrder, stalePendingOrder);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded 2 ticket orders (1 paid with CheckInCode, 1 stale pending).");
    }
}
