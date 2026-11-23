using Domain;
using Infrastructure.Data.Seed;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedData(
        DevMeetDbContext context,
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        await UserSeeder.SeedRolesAndUsersAsync(userManager, roleManager);
        await ActivitySeeder.SeedActivitiesAsync(context);
    }
}
