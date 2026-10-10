using Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Seed;

public static class ActivitySeeder
{
    public static async Task SeedActivitiesAsync(DevMeetDbContext context)
    {
        await CleanupLegacyActivitiesAsync(context);
        await BackfillMissingActivityDataAsync(context);

        if (await context.Activities.AnyAsync()) return;

        var activities = GetDefaultActivities();
        await context.Activities.AddRangeAsync(activities);
        await context.SaveChangesAsync();
    }

    private static async Task CleanupLegacyActivitiesAsync(DevMeetDbContext context)
    {
        var legacyActivities = await context.Activities
            .Where(a => a.Category == "culture" || a.Category == "drinks" || a.Category == "music" || a.City == "London" || a.Title == "Untitled Activity" || string.IsNullOrWhiteSpace(a.Title))
            .ToListAsync();

        if (legacyActivities.Count != 0)
        {
            context.Activities.RemoveRange(legacyActivities);
            await context.SaveChangesAsync();
        }
    }

    private static async Task BackfillMissingActivityDataAsync(DevMeetDbContext context)
    {
        var hasChanges = false;

        var activitiesWithoutSlug = await context.Activities.Where(a => string.IsNullOrEmpty(a.Slug)).ToListAsync();
        if (activitiesWithoutSlug.Count != 0)
        {
            foreach (var act in activitiesWithoutSlug)
            {
                var title = string.IsNullOrWhiteSpace(act.Title) ? "Untitled Activity" : act.Title;
                act.UpdateTitle(title);
            }
            hasChanges = true;
        }

        var activitiesWithoutImage = await context.Activities.Where(a => string.IsNullOrEmpty(a.Image)).ToListAsync();
        if (activitiesWithoutImage.Count != 0)
        {
            foreach (var act in activitiesWithoutImage)
            {
                var cat = (act.Category ?? "backend").ToLowerInvariant();
                act.UpdateImage($"/images/categoryImages/{cat}.jpg");
            }
            hasChanges = true;
        }

        var activitiesWithoutCoords = await context.Activities.Where(a => a.Latitude == 0 && a.Longitude == 0).ToListAsync();
        if (activitiesWithoutCoords.Count != 0)
        {
            foreach (var act in activitiesWithoutCoords)
            {
                act.UpdateLocation(
                    string.IsNullOrWhiteSpace(act.City) ? "Cairo" : act.City,
                    string.IsNullOrWhiteSpace(act.Venue) ? "The Greek Campus, Downtown Cairo" : act.Venue,
                    30.0444,
                    31.2357
                );
            }
            hasChanges = true;
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static List<Activity> GetDefaultActivities()
    {
        return
        [
            Activity.Create(
                title: "Cairo .NET 9 & Distributed Systems Masterclass",
                description: "Deep-dive technical workshop for senior Egyptian backend engineers at The Greek Campus exploring .NET 9 performance, Clean Architecture, CQRS, and Event-Driven microservices.",
                category: "BackEnd",
                date: DateTime.UtcNow.AddMonths(-1),
                city: "Cairo",
                venue: "The Greek Campus, Downtown Cairo",
                latitude: 30.0444,
                longitude: 31.2357,
                image: "/images/categoryImages/backend.jpg",
                level: "Advanced",
                tags: [".NET 9", "PostgreSQL", "Clean Architecture", "Redis", "Microservices"]
            ),
            Activity.Create(
                title: "Red Team & Web Penetration Testing Workshop",
                description: "Hands-on offensive security lab covering modern web vulnerabilities, automated recon, and exploiting misconfigurations in production environments.",
                category: "CyberSecurity",
                date: DateTime.UtcNow.AddDays(-14),
                city: "Giza",
                venue: "Smart Village ITIDA Tech Hub, 6th of October",
                latitude: 30.0736,
                longitude: 31.0185,
                image: "/images/categoryImages/cybersecurity.jpg",
                level: "Intermediate",
                tags: ["OWASP Top 10", "Ethical Hacking", "Burp Suite", "API Security", "Penetration Testing"]
            ),
            Activity.Create(
                title: "Modern React 19 & Next.js Performance Camp",
                description: "Full-day frontend conference by the Mediterranean Sea discussing React 19 Server Components, compiler optimization, and building accessible UI design systems.",
                category: "FrontEnd",
                date: DateTime.UtcNow.AddDays(4),
                city: "Alexandria",
                venue: "Bibliotheca Alexandrina Conference Hall, Al Shatby",
                latitude: 31.2089,
                longitude: 29.9092,
                image: "/images/categoryImages/frontend.jpg",
                level: "Intermediate",
                tags: ["React 19", "Next.js", "TypeScript", "TailwindCSS", "State Management"]
            ),
            Activity.Create(
                title: "Big Data & Business Intelligence with Power BI & SQL",
                description: "Learn how Egyptian fintech and telecom companies extract business insights using SQL warehousing, statistical modeling, and interactive Power BI dashboards.",
                category: "DataAnalysis",
                date: DateTime.UtcNow.AddDays(11),
                city: "Cairo",
                venue: "Nile City Towers, Corniche El Nil, Bulaq",
                latitude: 30.0719,
                longitude: 31.2291,
                image: "/images/categoryImages/dataanalysis.jpg",
                level: "Beginner",
                tags: ["Power BI", "SQL", "Python", "Pandas", "Data Cleaning"]
            ),
            Activity.Create(
                title: "Kubernetes & Cloud Infrastructure Boot Camp",
                description: "Intensive workshop on production Kubernetes deployments, zero-downtime rolling upgrades, GitOps pipelines, and monitoring with Prometheus and Grafana.",
                category: "DevOps",
                date: DateTime.UtcNow.AddDays(20),
                city: "Cairo",
                venue: "Maadi Tech Park, Investment Zone, Maadi",
                latitude: 29.9602,
                longitude: 31.2915,
                image: "/images/categoryImages/devops.jpg",
                level: "Advanced",
                tags: ["Docker", "Kubernetes", "CI/CD", "Terraform", "GitHub Actions"]
            ),
            Activity.Create(
                title: "Secure Cloud Identity & OAuth2 Deep Dive",
                description: "A technical session on securing modern APIs, JWT authentication lifecycles, OAuth2 authorization grants, and Zero Trust security architectures.",
                category: "CyberSecurity",
                date: DateTime.UtcNow.AddMonths(1),
                city: "New Cairo",
                venue: "American University in Cairo (AUC), New Cairo Campus",
                latitude: 30.0194,
                longitude: 31.4998,
                image: "/images/categoryImages/cybersecurity.jpg",
                level: "Advanced",
                tags: ["OAuth 2.0", "OpenID Connect", "JWT", "Zero Trust", "Cloud Security"]
            ),
            Activity.Create(
                title: "Frontend Architecture & Design Systems Meetup",
                description: "Practical discussions for junior and mid-level web developers on turning complex Figma designs into reusable React components with Material UI.",
                category: "FrontEnd",
                date: DateTime.UtcNow.AddMonths(1).AddDays(10),
                city: "Cairo",
                venue: "District Workspace, Sheraton Heliopolis",
                latitude: 30.0982,
                longitude: 31.3644,
                image: "/images/categoryImages/frontend.jpg",
                level: "Beginner",
                tags: ["UI/UX", "Material-UI", "Figma to Code", "Component Architecture"]
            ),
            Activity.Create(
                title: "Python for Machine Learning & Predictive Analytics",
                description: "Explore machine learning algorithms, training predictive models on real-world datasets, and evaluating model metrics with Python and Scikit-Learn.",
                category: "DataAnalysis",
                date: DateTime.UtcNow.AddMonths(2),
                city: "Mansoura",
                venue: "Mansoura University IT Center, Mansoura",
                latitude: 31.0425,
                longitude: 31.3553,
                image: "/images/categoryImages/dataanalysis.jpg",
                level: "Intermediate",
                tags: ["Machine Learning", "Scikit-Learn", "Data Visualization", "Jupyter"]
            ),
            Activity.Create(
                title: "Containerization & Microservices with Docker & Linux",
                description: "Beginner-friendly hands-on lab on packaging backend applications into Docker containers, writing multi-stage Dockerfiles, and deploying to Linux servers.",
                category: "DevOps",
                date: DateTime.UtcNow.AddMonths(3),
                city: "Assiut",
                venue: "Assiut Innovation & Tech Park, Assiut",
                latitude: 27.1809,
                longitude: 31.1837,
                image: "/images/categoryImages/devops.jpg",
                level: "Beginner",
                tags: ["Docker", "Linux", "Bash Scripting", "Nginx", "DevOps Fundamentals"]
            )
        ];
    }
}
