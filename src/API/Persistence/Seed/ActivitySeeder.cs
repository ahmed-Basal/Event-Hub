using Domain;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Seed;

public static class ActivitySeeder
{
    public static async Task SeedActivitiesAsync(DevMeetDbContext context)
    {
        if (!await context.Activities.AnyAsync())
        {
            var activities = GetDefaultActivities();
            await context.Activities.AddRangeAsync(activities);
            context.ClearAllDomainEvents();
            await context.SaveChangesAsync();
        }

        await SeedHostsAndAttendeesAsync(context);
        await SeedCommentsAsync(context);
        await SeedFollowingsAsync(context);
    }

    private static async Task SeedHostsAndAttendeesAsync(DevMeetDbContext context)
    {
        var users = await context.Users.OrderBy(u => u.Email).ToListAsync();
        if (users.Count == 0) return;

        var organizers = users.Take(5).ToList(); // Admin + Organizers
        var activities = await context.Activities
            .Include(a => a.Attendees)
            .OrderByDescending(a => a.Price)
            .ThenBy(a => a.Date)
            .ToListAsync();

        var addedAny = false;
        for (var i = 0; i < activities.Count; i++)
        {
            var activity = activities[i];
            if (activity.Attendees.Count > 0) continue;

            var host = organizers[i % organizers.Count];
            activity.AddAttendee(
                host.Id,
                isHost: true,
                dateJoined: DateTimeOffset.UtcNow.AddDays(-12),
                raiseEvent: false);

            // First event gets highest engagement so Hot Algorithm puts it #1
            var attendeeCount = i == 0 ? users.Count - 1 : Math.Min(users.Count - 1, 3 + (i % 5));
            for (var j = 0; j < users.Count && activity.Attendees.Count <= attendeeCount; j++)
            {
                var attendee = users[(i + j + 1) % users.Count];
                if (attendee.Id == host.Id || activity.Attendees.Any(a => a.UserId == attendee.Id)) continue;
                activity.AddAttendee(
                    attendee.Id,
                    isHost: false,
                    dateJoined: DateTimeOffset.UtcNow.AddDays(-Math.Max(1, 9 - (j % 8))),
                    raiseEvent: false);
            }

            addedAny = true;
        }

        if (addedAny)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedCommentsAsync(DevMeetDbContext context)
    {
        var users = await context.Users.OrderBy(u => u.Email).ToListAsync();
        if (users.Count < 2) return;

        var activities = await context.Activities
            .Include(a => a.Attendees)
            .Include(a => a.Comments)
            .OrderByDescending(a => a.Price)
            .ThenBy(a => a.Date)
            .ToListAsync();

        var sampleThreads = new[]
        {
            new[]
            {
                "ألف مبروك على السيشن ده يا هندسة! هل الكود والـ Architecture diagrams هتنزل على GitHub بعد الميتاب؟",
                "أكيد طبعاً! الريبو كامل بـ .NET 11 و Next.js 15 و Docker Compose هينزل فوراً بعد السيشن.",
                "عاش جداً — هجيب اللابتوب معايا عشان نطبق الـ Live SignalR & SSE عملي.",
                "هل القاعة فيها أماكن لركن العربيات ولا المترو أسهل؟"
            },
            new[]
            {
                "متحمس جداً للوركشوب ده! إحنا لسه مطبقين الـ Clean Architecture في شغلنا وعندنا كذا سؤال في الـ Production.",
                "منورنا يا باشمهندس! هنخصص آخر 30 دقيقة للـ Q&A ومناقشة تجارب الـ Production.",
                "هل السيشن مناسب للـ Mid-level ولا Senior فقط؟",
                "بنبدأ بالأساسيات في أول ربع ساعة وبعدين ندخل في الـ Deep Dive — الكل مرحب بيه."
            },
            new[]
            {
                "آخر سيشن لـ DevMeet Egypt كان ممتاز بجد، حجزت تذكرتي فوراً المرة دي!",
                "تسلم يا بطل! المرة دي زودنا Benchmarks حقيقية و Live Demo كامل.",
                "عزمت اتنين من التيم معايا كمان."
            }
        };

        var addedAny = false;
        for (var i = 0; i < activities.Count; i++)
        {
            var activity = activities[i];
            if (activity.Comments.Count > 0) continue;

            var hostId = activity.Attendees.FirstOrDefault(a => a.IsHost)?.UserId ?? users[0].Id;
            var host = users.First(u => u.Id == hostId);
            var others = users.Where(u => u.Id != host.Id).ToList();
            var thread = sampleThreads[i % sampleThreads.Length];

            for (var c = 0; c < thread.Length; c++)
            {
                var author = (c % 2 == 1) ? host : others[(i + c) % others.Count];
                context.Comments.Add(Comment.Create(
                    activity.ID,
                    author.Id,
                    thread[c],
                    DateTimeOffset.UtcNow.AddHours(-(thread.Length - c) * 2)));
            }

            addedAny = true;
        }

        if (addedAny)
        {
            context.ClearAllDomainEvents();
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedFollowingsAsync(DevMeetDbContext context)
    {
        if (await context.UserFollowings.AnyAsync()) return;

        var users = await context.Users.OrderBy(u => u.Email).ToListAsync();
        if (users.Count < 3) return;

        var pairs = new HashSet<(string, string)>();
        for (var i = 0; i < users.Count; i++)
        {
            for (var step = 1; step <= 3; step++)
            {
                var target = users[(i + step) % users.Count];
                if (users[i].Id != target.Id && pairs.Add((users[i].Id, target.Id)))
                {
                    context.UserFollowings.Add(UserFollowing.Create(users[i].Id, target.Id));
                }
            }
        }

        context.ClearAllDomainEvents();
        await context.SaveChangesAsync();
    }

    public static List<Activity> GetDefaultActivities()
    {
        var nowUtc = DateTimeOffset.UtcNow;

        return
        [
            Activity.Create(
                title: "Cairo .NET 11 & Distributed Systems Masterclass",
                description: "Flagship full-day engineering workshop at The Greek Campus led by Ahmed Basal & Tarek Mostafa covering .NET 11 performance, 4-Layer Clean Architecture, CQRS, SignalR WebSockets, and Server-Sent Events.",
                category: "BackEnd",
                date: nowUtc.AddDays(3),
                city: "Cairo",
                venue: "The Greek Campus, Downtown Cairo",
                latitude: 30.0444,
                longitude: 31.2357,
                image: "/images/categoryImages/backend.jpg",
                level: "Advanced",
                tags: [".NET 11", "PostgreSQL", "Clean Architecture", "SignalR", "SSE"],
                price: 35m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Modern React 19 & Next.js 15 SSR Performance Camp",
                description: "Comprehensive frontend summit at Bibliotheca Alexandrina exploring React Server Components, Streaming Suspense, Zustand global state, React Hook Form + Zod, and core web vitals optimization.",
                category: "FrontEnd",
                date: nowUtc.AddDays(6),
                city: "Alexandria",
                venue: "Bibliotheca Alexandrina Conference Hall, Al Shatby",
                latitude: 31.2089,
                longitude: 29.9092,
                image: "/images/categoryImages/frontend.jpg",
                level: "Intermediate",
                tags: ["React 19", "Next.js 15", "TypeScript", "Zustand", "MUI"],
                price: 25m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Kubernetes & Cloud Infrastructure Boot Camp",
                description: "Intensive hands-on bootcamp in Maadi Tech Park on production Kubernetes deployments, zero-downtime rolling upgrades, Terraform IaC, and Prometheus + Grafana observability.",
                category: "DevOps",
                date: nowUtc.AddDays(10),
                city: "Cairo",
                venue: "Maadi Tech Park, Investment Zone, Maadi",
                latitude: 29.9602,
                longitude: 31.2915,
                image: "/images/categoryImages/devops.jpg",
                level: "Advanced",
                tags: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
                price: 40m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Secure Cloud Identity, OAuth2 & Zero Trust Deep Dive",
                description: "Practical security engineering session at AUC New Cairo on hardening REST APIs, JWT rotation, RBAC authorization policies, Stripe webhook signature verification, and Zero Trust.",
                category: "CyberSecurity",
                date: nowUtc.AddDays(15),
                city: "New Cairo",
                venue: "American University in Cairo (AUC), New Cairo Campus",
                latitude: 30.0194,
                longitude: 31.4998,
                image: "/images/categoryImages/cybersecurity.jpg",
                level: "Advanced",
                tags: ["OAuth 2.0", "JWT", "RBAC", "Zero Trust"],
                price: 30m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Big Data & Business Intelligence with SQL & Power BI",
                description: "Learn how Egyptian fintech and telecom engineering teams build high-speed SQL warehouses, statistical models, and executive Power BI dashboards.",
                category: "DataAnalysis",
                date: nowUtc.AddDays(20),
                city: "Cairo",
                venue: "Nile City Towers, Corniche El Nil, Bulaq",
                latitude: 30.0719,
                longitude: 31.2291,
                image: "/images/categoryImages/dataanalysis.jpg",
                level: "Beginner",
                tags: ["Power BI", "SQL", "Python", "Pandas"],
                price: 20m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Real-Time Systems: SignalR vs Server-Sent Events",
                description: "Hands-on engineering night at Smart Village comparing WebSockets/SignalR hubs and native HTTP SSE streams for live chat, dashboards, and instant notifications.",
                category: "BackEnd",
                date: nowUtc.AddDays(26),
                city: "Giza",
                venue: "Smart Village Innovation Hub, 6th of October",
                latitude: 30.0736,
                longitude: 31.0185,
                image: "/images/categoryImages/backend.jpg",
                level: "Intermediate",
                tags: ["SignalR", "SSE", "ASP.NET Core", "Real-Time"],
                price: 15m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Frontend Architecture & Design Systems Meetup",
                description: "Practical discussions for web developers on turning Figma tokens into reusable Material UI component libraries with strict accessibility and zero layout shift.",
                category: "FrontEnd",
                date: nowUtc.AddDays(32),
                city: "Cairo",
                venue: "District Workspace, Sheraton Heliopolis",
                latitude: 30.0982,
                longitude: 31.3644,
                image: "/images/categoryImages/frontend.jpg",
                level: "Beginner",
                tags: ["UI/UX", "Material-UI", "Design Systems", "Next.js"],
                price: 15m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Observability in Production: OpenTelemetry, Seq & Jaeger",
                description: "Instrumenting distributed .NET APIs with structured Serilog logs, OpenTelemetry traces, and Prometheus metrics to eliminate blind spots in production.",
                category: "DevOps",
                date: nowUtc.AddDays(39),
                city: "Cairo",
                venue: "Consoleya Coworking, Downtown Cairo",
                latitude: 30.0478,
                longitude: 31.2392,
                image: "/images/categoryImages/devops.jpg",
                level: "Intermediate",
                tags: ["OpenTelemetry", "Grafana", "Jaeger", "Seq"],
                price: 25m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Python for Machine Learning & Arabic NLP",
                description: "Explore machine learning pipelines, fine-tuning Arabic language models, training predictive models on real datasets, and evaluating metrics with Scikit-Learn.",
                category: "DataAnalysis",
                date: nowUtc.AddDays(47),
                city: "Mansoura",
                venue: "Mansoura University IT Center, Mansoura",
                latitude: 31.0425,
                longitude: 31.3553,
                image: "/images/categoryImages/dataanalysis.jpg",
                level: "Intermediate",
                tags: ["Machine Learning", "Arabic NLP", "Python", "Jupyter"],
                price: 20m,
                currency: "usd"
            ),
            Activity.Create(
                title: "PostgreSQL Indexing & EF Core Query Optimization Clinic",
                description: "Bring your slow EF Core queries! We analyze EXPLAIN ANALYZE plans, composite indexes, SplitQuery strategies, and N+1 elimination live.",
                category: "BackEnd",
                date: nowUtc.AddDays(54),
                city: "Giza",
                venue: "Creativa Innovation Hub, Giza",
                latitude: 30.0275,
                longitude: 31.2094,
                image: "/images/categoryImages/backend.jpg",
                level: "Advanced",
                tags: ["PostgreSQL", "EF Core", "SQL Tuning", "Performance"],
                price: 30m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Containerization & Microservices with Docker & Linux",
                description: "Hands-on lab in Assiut on packaging full-stack .NET & Next.js apps into multi-stage Docker containers and deploying cleanly to Linux servers.",
                category: "DevOps",
                date: nowUtc.AddDays(62),
                city: "Assiut",
                venue: "Assiut Innovation & Tech Park, Assiut",
                latitude: 27.1809,
                longitude: 31.1837,
                image: "/images/categoryImages/devops.jpg",
                level: "Beginner",
                tags: ["Docker", "Linux", "Nginx", "Containers"],
                price: 15m,
                currency: "usd"
            ),
            Activity.Create(
                title: "Red Team & Web Penetration Testing Workshop",
                description: "Hands-on offensive security lab covering OWASP Top 10, automated recon, and securing production APIs against real-world exploits.",
                category: "CyberSecurity",
                date: nowUtc.AddDays(-10),
                city: "Giza",
                venue: "Smart Village ITIDA Tech Hub, 6th of October",
                latitude: 30.0736,
                longitude: 31.0185,
                image: "/images/categoryImages/cybersecurity.jpg",
                level: "Intermediate",
                tags: ["OWASP Top 10", "API Security", "Penetration Testing"],
                price: 25m,
                currency: "usd"
            )
        ];
    }
}
