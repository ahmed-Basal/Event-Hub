using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Seed;

public static class UserSeeder
{
    public static async Task SeedUsersAsync(UserManager<User> userManager)
    {
        var users = GetInitialUsers();

        foreach (var user in users)
        {
            if (await userManager.FindByEmailAsync(user.Email!) is null)
            {
                var result = await userManager.CreateAsync(user, "Pa$$w0rd");
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to seed user '{user.UserName}': {errors}");
                }
            }
        }
    }

    public static List<User> GetInitialUsers()
    {
        return
        [
            new()
            {
                DisplayName = "Ahmed Basal",
                UserName = "ahmed.basal@devmeet.com",
                Email = "ahmed.basal@devmeet.com",
                Bio = "Lead Full-Stack .NET & React Engineer, Community Organizer at DevMeet Egypt.",
                Picture = "/images/user.png"
            },
            new()
            {
                DisplayName = "Noureldeen Mahmoud",
                UserName = "noureldeen@devmeet.com",
                Email = "noureldeen@devmeet.com",
                Bio = "Senior Cloud & DevOps Engineer specializing in Kubernetes, Microservices, and Linux Infrastructure.",
                Picture = "/images/user.png"
            },
            new()
            {
                DisplayName = "Mariam Khaled",
                UserName = "mariam@devmeet.com",
                Email = "mariam@devmeet.com",
                Bio = "Cybersecurity Specialist & Penetration Tester focusing on OWASP, Cloud Identity, and Threat Modeling.",
                Picture = "/images/user.png"
            }
        ];
    }
}
