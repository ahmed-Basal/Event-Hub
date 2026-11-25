using Comments.Module.Domain;
using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Comments.Module.Infrastructure;

public sealed class CommentsSeeder(CommentsDbContext db, ILogger<CommentsSeeder> logger) : IModuleSeeder
{
    public int Order => 4;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Comments.AnyAsync(ct))
            return;

        var now = DateTimeOffset.UtcNow;
        var c1 = Comment.Create(
            SeedConstants.Activities.DotNetCairoId,
            SeedConstants.Users.BobId,
            "Excited for the Hangfire & Modular Monolith deep dive!",
            now.AddHours(-6),
            "cmt-seed-001");
        c1.ClearDomainEvents();

        var c2 = Comment.Create(
            SeedConstants.Activities.DotNetCairoId,
            SeedConstants.Users.OmarId,
            "On the waitlist — hope a seat opens up!",
            now.AddHours(-2),
            "cmt-seed-002");
        c2.ClearDomainEvents();

        db.Comments.AddRange(c1, c2);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded 2 comments.");
    }
}
