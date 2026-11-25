using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Identity.Module.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Identity.Module.Infrastructure;

public sealed class IdentitySeeder(IdentityDbContext db, ILogger<IdentitySeeder> logger) : IModuleSeeder
{
    public int Order => 1;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
            return;

        var users = new[]
        {
            AppUser.Create(
                id: SeedConstants.Users.AdminId,
                userName: "admin",
                email: "admin@test.com",
                displayName: "Admin User",
                bio: "DevMeet platform administrator.",
                picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
                roles: [AppRoles.Admin, AppRoles.Organizer, AppRoles.User]),

            AppUser.Create(
                id: SeedConstants.Users.SaraId,
                userName: "sara",
                email: "sara@test.com",
                displayName: "Sara Hassan",
                bio: "Cloud & .NET community organizer in Cairo.",
                picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
                roles: [AppRoles.Organizer, AppRoles.User]),

            AppUser.Create(
                id: SeedConstants.Users.OmarId,
                userName: "omar",
                email: "omar@test.com",
                displayName: "Omar Khaled",
                bio: "Frontend architect & React Alexandria lead.",
                picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
                roles: [AppRoles.Organizer, AppRoles.User]),

            AppUser.Create(
                id: SeedConstants.Users.BobId,
                userName: "bob",
                email: "bob@test.com",
                displayName: "Bob Smith",
                bio: "Full-stack developer exploring AI & distributed systems.",
                picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
                roles: [AppRoles.User])
        };

        db.Users.AddRange(users);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded {Count} Identity users matching Keycloak realm.", users.Length);
    }
}
