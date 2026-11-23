using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;

namespace API.Extensions;

public static class MigrationExtensions
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        try
        {
            var context = services.GetRequiredService<DevMeetDbContext>();
            await context.Database.MigrateAsync();
            var userManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<Domain.User>>();
            var roleManager = services.GetRequiredService<Microsoft.AspNetCore.Identity.RoleManager<Microsoft.AspNetCore.Identity.IdentityRole>>();
            await DbInitializer.SeedData(context, userManager, roleManager);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred during migration/seeding");
        }
    }
}
