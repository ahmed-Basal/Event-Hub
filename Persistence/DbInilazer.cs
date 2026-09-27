using Domain;
using Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public static class DbInitializer
{
    public static async Task SeedData(DevMeetDbContext context)
    {
        // Automatically replace old non-tech categories or sample cities
        if (await context.Activities.AnyAsync(a => a.Category == "culture" || a.Category == "drinks" || a.Category == "music" || a.City == "London"))
        {
            context.Activities.RemoveRange(context.Activities);
            await context.SaveChangesAsync();
        }

        // Backfill slugs for any activities missing a slug
        var activitiesWithoutSlug = await context.Activities.Where(a => string.IsNullOrEmpty(a.Slug)).ToListAsync();
        if (activitiesWithoutSlug.Count != 0)
        {
            foreach (var act in activitiesWithoutSlug)
            {
                act.Slug = SlugHelper.GenerateSlug(act.Title);
            }
            await context.SaveChangesAsync();
        }

        if (await context.Activities.AnyAsync()) return;

        var activities = new List<Activity>
        {
            new() {
                Title = "Cairo .NET 9 & Distributed Systems Masterclass",
                Date = DateTime.UtcNow.AddMonths(-1),
                Description = "Deep-dive technical workshop for senior Egyptian backend engineers at The Greek Campus exploring .NET 9 performance, Clean Architecture, CQRS, and Event-Driven microservices.",
                Category = "BackEnd",
                City = "Cairo",
                Venue = "The Greek Campus, Downtown Cairo",
                Latitude = 30.0444,
                Longitude = 31.2357,
                Level = "Advanced",
                Tags = [".NET 9", "PostgreSQL", "Clean Architecture", "Redis", "Microservices"]
            },
            new() {
                Title = "Red Team & Web Penetration Testing Workshop",
                Date = DateTime.UtcNow.AddDays(-14),
                Description = "Hands-on offensive security lab covering modern web vulnerabilities, automated recon, and exploiting misconfigurations in production environments.",
                Category = "CyberSecurity",
                City = "Giza",
                Venue = "Smart Village ITIDA Tech Hub, 6th of October",
                Latitude = 30.0736,
                Longitude = 31.0185,
                Level = "Intermediate",
                Tags = ["OWASP Top 10", "Ethical Hacking", "Burp Suite", "API Security", "Penetration Testing"]
            },
            new() {
                Title = "Modern React 19 & Next.js Performance Camp",
                Date = DateTime.UtcNow.AddDays(4),
                Description = "Full-day frontend conference by the Mediterranean Sea discussing React 19 Server Components, compiler optimization, and building accessible UI design systems.",
                Category = "FrontEnd",
                City = "Alexandria",
                Venue = "Bibliotheca Alexandrina Conference Hall, Al Shatby",
                Latitude = 31.2089,
                Longitude = 29.9092,
                Level = "Intermediate",
                Tags = ["React 19", "Next.js", "TypeScript", "TailwindCSS", "State Management"]
            },
            new() {
                Title = "Big Data & Business Intelligence with Power BI & SQL",
                Date = DateTime.UtcNow.AddDays(11),
                Description = "Learn how Egyptian fintech and telecom companies extract business insights using SQL warehousing, statistical modeling, and interactive Power BI dashboards.",
                Category = "DataAnalysis",
                City = "Cairo",
                Venue = "Nile City Towers, Corniche El Nil, Bulaq",
                Latitude = 30.0719,
                Longitude = 31.2291,
                Level = "Beginner",
                Tags = ["Power BI", "SQL", "Python", "Pandas", "Data Cleaning"]
            },
            new() {
                Title = "Kubernetes & Cloud Infrastructure Boot Camp",
                Date = DateTime.UtcNow.AddDays(20),
                Description = "Intensive workshop on production Kubernetes deployments, zero-downtime rolling upgrades, GitOps pipelines, and monitoring with Prometheus and Grafana.",
                Category = "DevOps",
                City = "Cairo",
                Venue = "Maadi Tech Park, Investment Zone, Maadi",
                Latitude = 29.9602,
                Longitude = 31.2915,
                Level = "Advanced",
                Tags = ["Docker", "Kubernetes", "CI/CD", "Terraform", "GitHub Actions"]
            },
            new() {
                Title = "Secure Cloud Identity & OAuth2 Deep Dive",
                Date = DateTime.UtcNow.AddMonths(1),
                Description = "A technical session on securing modern APIs, JWT authentication lifecycles, OAuth2 authorization grants, and Zero Trust security architectures.",
                Category = "CyberSecurity",
                City = "New Cairo",
                Venue = "American University in Cairo (AUC), New Cairo Campus",
                Latitude = 30.0194,
                Longitude = 31.4998,
                Level = "Advanced",
                Tags = ["OAuth 2.0", "OpenID Connect", "JWT", "Zero Trust", "Cloud Security"]
            },
            new() {
                Title = "Frontend Architecture & Design Systems Meetup",
                Date = DateTime.UtcNow.AddMonths(1).AddDays(10),
                Description = "Practical discussions for junior and mid-level web developers on turning complex Figma designs into reusable React components with Material UI.",
                Category = "FrontEnd",
                City = "Cairo",
                Venue = "District Workspace, Sheraton Heliopolis",
                Latitude = 30.0982,
                Longitude = 31.3644,
                Level = "Beginner",
                Tags = ["UI/UX", "Material-UI", "Figma to Code", "Component Architecture"]
            },
            new() {
                Title = "Python for Machine Learning & Predictive Analytics",
                Date = DateTime.UtcNow.AddMonths(2),
                Description = "Explore machine learning algorithms, training predictive models on real-world datasets, and evaluating model metrics with Python and Scikit-Learn.",
                Category = "DataAnalysis",
                City = "Mansoura",
                Venue = "Mansoura University IT Center, Mansoura",
                Latitude = 31.0425,
                Longitude = 31.3553,
                Level = "Intermediate",
                Tags = ["Machine Learning", "Scikit-Learn", "Data Visualization", "Jupyter"]
            },
            new() {
                Title = "Containerization & Microservices with Docker & Linux",
                Date = DateTime.UtcNow.AddMonths(3),
                Description = "Beginner-friendly hands-on lab on packaging backend applications into Docker containers, writing multi-stage Dockerfiles, and deploying to Linux servers.",
                Category = "DevOps",
                City = "Assiut",
                Venue = "Assiut Innovation & Tech Park, Assiut",
                Latitude = 27.1809,
                Longitude = 31.1837,
                Level = "Beginner",
                Tags = ["Docker", "Linux", "Bash Scripting", "Nginx", "DevOps Fundamentals"]
            }
        };

        await context.Activities.AddRangeAsync(activities);
        await context.SaveChangesAsync();
    }
}
