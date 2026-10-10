using Core.Domain;
using Microsoft.AspNetCore.Identity;
using Infrastructure.Data.Seed;

namespace Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedData(DevMeetDbContext context, UserManager<User> userManager)
    {
        await UserSeeder.SeedUsersAsync(userManager);
        await ActivitySeeder.SeedActivitiesAsync(context);
    }
}
