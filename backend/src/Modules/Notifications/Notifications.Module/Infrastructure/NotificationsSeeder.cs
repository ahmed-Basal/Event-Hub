using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Notifications.Contracts;
using Notifications.Module.Domain;

namespace Notifications.Module.Infrastructure;

public sealed class NotificationsSeeder(
    NotificationsDbContext db,
    ILogger<NotificationsSeeder> logger) : IModuleSeeder
{
    public int Order => 6;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Notifications.AnyAsync(ct))
            return;

        var notifications = new[]
        {
            Notification.Create(
                recipientId: SeedConstants.Users.BobId,
                type: NotificationType.TicketPurchased,
                message: "Your ticket for Applied AI Engineering Bootcamp is confirmed!",
                targetUrl: $"/activities/{SeedConstants.Activities.AiWorkshopId}",
                id: "notif-seed-001"),

            Notification.Create(
                recipientId: SeedConstants.Users.SaraId,
                type: NotificationType.ActivityJoined,
                message: "Bob Smith joined '.NET 11 & Modular Monoliths Cairo'.",
                actorId: SeedConstants.Users.BobId,
                targetUrl: $"/activities/{SeedConstants.Activities.DotNetCairoId}",
                id: "notif-seed-002"),

            Notification.Create(
                recipientId: SeedConstants.Users.OmarId,
                type: NotificationType.NewFollower,
                message: "Bob Smith started following you.",
                actorId: SeedConstants.Users.BobId,
                targetUrl: "/profiles/bob",
                id: "notif-seed-003")
        };

        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded {Count} initial notifications.", notifications.Length);
    }
}
