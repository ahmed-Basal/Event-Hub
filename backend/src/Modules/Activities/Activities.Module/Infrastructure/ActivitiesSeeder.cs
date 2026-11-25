using Activities.Module.Domain;
using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Activities.Module.Infrastructure;

public sealed class ActivitiesSeeder(ActivitiesDbContext db, ILogger<ActivitiesSeeder> logger) : IModuleSeeder
{
    public int Order => 3;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (await db.Activities.AnyAsync(ct))
            return;

        var now = DateTimeOffset.UtcNow;

        var dotnetCairo = Activity.Create(
            title: ".NET 11 & Modular Monoliths Cairo",
            description: "Deep dive into Vertical Slice Architecture, FastEndpoints, and Hangfire background workers in production.",
            category: "backend",
            date: now.AddDays(5),
            city: "Cairo",
            venue: "The Greek Campus, Downtown",
            latitude: 30.0444,
            longitude: 31.2357,
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            level: "Intermediate",
            tags: ["dotnet", "architecture", "hangfire"],
            id: SeedConstants.Activities.DotNetCairoId,
            maxCapacity: 2);
        dotnetCairo.AddAttendee(SeedConstants.Users.SaraId, isHost: true, raiseEvent: false);
        dotnetCairo.AddAttendee(SeedConstants.Users.BobId, isHost: false, raiseEvent: false);
        dotnetCairo.JoinWaitlist(SeedConstants.Users.OmarId, now.AddMinutes(-15));
        dotnetCairo.ClearDomainEvents();

        var reactAlex = Activity.Create(
            title: "Next.js 15 & React 19 Patterns",
            description: "Building isolated frontend feature slices with BFF OIDC authentication and TanStack Query.",
            category: "frontend",
            date: now.AddDays(10),
            city: "Alexandria",
            venue: "Bibliotheca Alexandrina Conference Center",
            latitude: 31.2089,
            longitude: 29.9092,
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
            level: "All Levels",
            tags: ["react", "nextjs", "typescript"],
            id: SeedConstants.Activities.ReactAlexId,
            maxCapacity: 60);
        reactAlex.AddAttendee(SeedConstants.Users.OmarId, isHost: true, raiseEvent: false);
        reactAlex.AddAttendee(SeedConstants.Users.SaraId, isHost: false, raiseEvent: false);
        reactAlex.ClearDomainEvents();

        var aiWorkshop = Activity.Create(
            title: "Applied AI Engineering Bootcamp",
            description: "Hands-on full-day workshop on RAG pipelines, evaluation harnesses, and scalable inference.",
            category: "ai",
            date: now.AddDays(14),
            city: "Cairo",
            venue: "Smart Village Tech Hub",
            latitude: 30.0715,
            longitude: 31.0169,
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
            level: "Advanced",
            tags: ["ai", "llm", "python"],
            id: SeedConstants.Activities.AiWorkshopId,
            price: 49.00m,
            currency: "usd",
            maxCapacity: 40);
        aiWorkshop.AddAttendee(SeedConstants.Users.SaraId, isHost: true, raiseEvent: false);
        aiWorkshop.AddAttendee(SeedConstants.Users.BobId, isHost: false, raiseEvent: false);
        aiWorkshop.ClearDomainEvents();

        var cloudSummit = Activity.Create(
            title: "Cloud Native & Observability Summit",
            description: "OpenTelemetry tracing, Prometheus alerting, Grafana dashboards, and Keycloak zero-trust auth.",
            category: "devops",
            date: now.AddDays(21),
            city: "Giza",
            venue: "Creativa Innovation Hub",
            latitude: 30.0296,
            longitude: 31.2088,
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
            level: "Intermediate",
            tags: ["otel", "docker", "kubernetes"],
            id: SeedConstants.Activities.CloudSummitId,
            price: 25.00m,
            currency: "usd",
            maxCapacity: 100);
        cloudSummit.AddAttendee(SeedConstants.Users.AdminId, isHost: true, raiseEvent: false);
        cloudSummit.ClearDomainEvents();

        var securityMeetup = Activity.Create(
            title: "OAuth 2.1, PKCE & TOTP Hardening",
            description: "Practical security walkthrough for modern SPAs and microservices using Keycloak 26.",
            category: "security",
            date: now.AddDays(-7),
            city: "Cairo",
            venue: "Maadi Tech Loft",
            latitude: 29.9602,
            longitude: 31.2569,
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
            level: "All Levels",
            tags: ["security", "keycloak", "oauth"],
            id: SeedConstants.Activities.SecurityMeetupId,
            maxCapacity: 35);
        securityMeetup.AddAttendee(SeedConstants.Users.OmarId, isHost: true, raiseEvent: false);
        securityMeetup.AddAttendee(SeedConstants.Users.BobId, isHost: false, raiseEvent: false);
        securityMeetup.ClearDomainEvents();

        var upcomingReminder = Activity.Create(
            title: "Cairo Architecture Coffee & Code",
            description: "Morning architectural roundtable starting within 24 hours — verifies Hangfire reminder dispatch.",
            category: "backend",
            date: now.AddHours(23),
            city: "Cairo",
            venue: "Zamalek Coworking Space",
            latitude: 30.0609,
            longitude: 31.2197,
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
            level: "All Levels",
            tags: ["architecture", "coffee", "networking"],
            id: SeedConstants.Activities.UpcomingReminderId,
            maxCapacity: 15);
        upcomingReminder.AddAttendee(SeedConstants.Users.SaraId, isHost: true, raiseEvent: false);
        upcomingReminder.AddAttendee(SeedConstants.Users.BobId, isHost: false, raiseEvent: false);
        upcomingReminder.ClearDomainEvents();

        db.Activities.AddRange(dotnetCairo, reactAlex, aiWorkshop, cloudSummit, securityMeetup, upcomingReminder);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded 6 DevMeet activities including waitlist and upcoming reminder test events.");
    }
}
