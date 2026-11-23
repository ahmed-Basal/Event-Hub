using Domain;
using Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data.Seed;

public static class UserSeeder
{
    public static async Task SeedRolesAndUsersAsync(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        var roleAssignments = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["adhmedbassl913@gmail.com"] = [AppRoles.Admin, AppRoles.Organizer, AppRoles.Member],
            ["tarek.mostafa@devmeet.com"] = [AppRoles.Organizer, AppRoles.Member],
            ["noureldeen@devmeet.com"] = [AppRoles.Organizer, AppRoles.Member],
            ["mariam.khaled@devmeet.com"] = [AppRoles.Organizer, AppRoles.Member],
            ["youssef.masry@devmeet.com"] = [AppRoles.Organizer, AppRoles.Member],
            ["salma.hassan@devmeet.com"] = [AppRoles.Member],
            ["omar.shazly@devmeet.com"] = [AppRoles.Member],
            ["karim.elsayed@devmeet.com"] = [AppRoles.Member],
            ["nada.mansour@devmeet.com"] = [AppRoles.Member],
            ["khaled.gamal@devmeet.com"] = [AppRoles.Member],
        };

        foreach (var (seedUser, password) in GetInitialUsers())
        {
            var existing = await userManager.FindByEmailAsync(seedUser.Email!);
            if (existing is null)
            {
                var result = await userManager.CreateAsync(seedUser, password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to seed user '{seedUser.UserName}': {errors}");
                }
                existing = seedUser;
            }

            if (roleAssignments.TryGetValue(existing.Email!, out var desiredRoles))
            {
                foreach (var role in desiredRoles)
                {
                    if (!await userManager.IsInRoleAsync(existing, role))
                    {
                        await userManager.AddToRoleAsync(existing, role);
                    }
                }
            }
        }
    }

    public static List<(User User, string Password)> GetInitialUsers()
    {
        return
        [
            (User.Create(
                userName: "adhmedbassl913@gmail.com",
                email: "adhmedbassl913@gmail.com",
                displayName: "Ahmed Basal",
                bio: "Platform Founder & Lead .NET / Next.js Architect at DevMeet Egypt. Passionate about Clean Architecture, SignalR, and high-scale distributed systems.",
                picture: "/images/user.png",
                emailConfirmed: true), "jokerkillme75#"),
            (User.Create(
                userName: "tarek.mostafa@devmeet.com",
                email: "tarek.mostafa@devmeet.com",
                displayName: "Tarek Mostafa",
                bio: "Principal Backend Engineer & .NET Community Speaker in Cairo. Specializing in CQRS, PostgreSQL tuning, and Event-Driven Systems.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "noureldeen@devmeet.com",
                email: "noureldeen@devmeet.com",
                displayName: "Noureldeen Mahmoud",
                bio: "Senior Cloud & DevOps Engineer specializing in Kubernetes, Terraform, CI/CD, and Linux Infrastructure.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "mariam.khaled@devmeet.com",
                email: "mariam.khaled@devmeet.com",
                displayName: "Mariam Khaled",
                bio: "Cybersecurity Lead & Ethical Hacker focusing on OWASP, Cloud Identity, OAuth2, and API Threat Modeling.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "youssef.masry@devmeet.com",
                email: "youssef.masry@devmeet.com",
                displayName: "Youssef El-Masry",
                bio: "Staff Frontend Architect — React 19, Next.js App Router, SSR Performance & Design Systems.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "salma.hassan@devmeet.com",
                email: "salma.hassan@devmeet.com",
                displayName: "Salma Hassan",
                bio: "Senior Data Scientist & ML Engineer building production analytics and Arabic NLP pipelines.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "omar.shazly@devmeet.com",
                email: "omar.shazly@devmeet.com",
                displayName: "Omar El-Shazly",
                bio: "Distributed Systems & .NET Performance Engineer. SignalR, gRPC, Redis, and PostgreSQL enthusiast.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "karim.elsayed@devmeet.com",
                email: "karim.elsayed@devmeet.com",
                displayName: "Karim El-Sayed",
                bio: "Platform Engineer & SRE. OpenTelemetry, Prometheus, Grafana & Docker.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "nada.mansour@devmeet.com",
                email: "nada.mansour@devmeet.com",
                displayName: "Nada Mansour",
                bio: "Full-Stack TypeScript & .NET Developer passionate about Egyptian tech communities and developer tooling.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd"),
            (User.Create(
                userName: "khaled.gamal@devmeet.com",
                email: "khaled.gamal@devmeet.com",
                displayName: "Khaled El-Gamal",
                bio: "Solutions Architect & Cloud Security Consultant based in Alexandria.",
                picture: "/images/user.png",
                emailConfirmed: true), "Pa$$w0rd")
        ];
    }
}
