using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Profiles.Module.Domain;

namespace Profiles.Module.Infrastructure;

public sealed class ProfilesSeeder(ProfilesDbContext db, ILogger<ProfilesSeeder> logger) : IModuleSeeder
{
    public int Order => 2;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (!await db.Photos.AnyAsync(ct))
        {
            db.Photos.AddRange(
                Photo.Create("photo-seed-sara", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300", SeedConstants.Users.SaraId, isMain: true),
                Photo.Create("photo-seed-omar", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", SeedConstants.Users.OmarId, isMain: true),
                Photo.Create("photo-seed-bob", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", SeedConstants.Users.BobId, isMain: true));
        }

        if (!await db.UserFollowings.AnyAsync(ct))
        {
            var f1 = UserFollowing.Create(SeedConstants.Users.BobId, SeedConstants.Users.SaraId);
            var f2 = UserFollowing.Create(SeedConstants.Users.BobId, SeedConstants.Users.OmarId);
            var f3 = UserFollowing.Create(SeedConstants.Users.SaraId, SeedConstants.Users.OmarId);
            f1.ClearDomainEvents();
            f2.ClearDomainEvents();
            f3.ClearDomainEvents();
            db.UserFollowings.AddRange(f1, f2, f3);
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded profile photos and user followings.");
    }
}
