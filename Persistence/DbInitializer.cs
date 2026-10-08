using Domain;
using Microsoft.AspNetCore.Identity;
using Persistence.Seed;

namespace Persistence;

public static class DbInitializer
{
    public static async Task SeedData(DevMeetDbContext context, UserManager<User> userManager)
    {
        await UserSeeder.SeedUsersAsync(userManager);
        await ActivitySeeder.SeedActivitiesAsync(context);
    }
}
