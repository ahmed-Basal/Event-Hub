using System.Reflection;
using Activities.Contracts;
using Activities.Module;
using Comments.Module;
using DevMeet.API.Options;
using DevMeet.Shared.Common;
using DevMeet.Shared.Seeding;
using Diagnostics.Module;
using FastEndpoints;
using Hangfire;
using Identity.Contracts;
using Identity.Module;
using Identity.Module.Jobs;
using Activities.Module.Jobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notifications.Contracts;
using Notifications.Module;
using Notifications.Module.Jobs;
using Payments.Contracts;
using Payments.Module;
using Payments.Module.Jobs;
using Profiles.Contracts;
using Profiles.Module;

namespace Architecture.Tests;

public class LayerBoundaryTests
{
    private static readonly Assembly[] ModuleAssemblies =
    [
        typeof(IdentityModule).Assembly,
        typeof(ActivitiesModule).Assembly,
        typeof(CommentsModule).Assembly,
        typeof(ProfilesModule).Assembly,
        typeof(NotificationsModule).Assembly,
        typeof(PaymentsModule).Assembly,
        typeof(DiagnosticsModule).Assembly
    ];

    private static readonly Assembly[] ContractAssemblies =
    [
        typeof(IIdentityDirectory).Assembly,
        typeof(IActivitiesDirectory).Assembly,
        typeof(IProfilesDirectory).Assembly,
        typeof(INotificationPublisher).Assembly,
        typeof(IPaymentsDirectory).Assembly
    ];

    [Fact]
    public void Modules_ShouldNotReference_OtherModuleAssemblies()
    {
        foreach (var moduleAssembly in ModuleAssemblies)
        {
            var moduleName = moduleAssembly.GetName().Name!;
            var referenced = moduleAssembly.GetReferencedAssemblies()
                .Select(a => a.Name!)
                .ToList();

            Assert.DoesNotContain(referenced, r =>
                r.EndsWith(".Module", StringComparison.OrdinalIgnoreCase) &&
                !r.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
        }
    }

    [Fact]
    public void Contracts_ShouldNotReference_AnyModuleAssembly()
    {
        foreach (var contractAssembly in ContractAssemblies)
        {
            var referenced = contractAssembly.GetReferencedAssemblies()
                .Select(a => a.Name!)
                .ToList();

            Assert.DoesNotContain(referenced, r => r.EndsWith(".Module", StringComparison.OrdinalIgnoreCase));
        }
    }

    [Fact]
    public void Solution_ShouldNotDependOn_LegacyMediatR_AutoMapper_Or_AspNetIdentity()
    {
        var allAssemblies = ModuleAssemblies.Append(typeof(ApiSettings).Assembly);
        foreach (var asm in allAssemblies)
        {
            var referenced = asm.GetReferencedAssemblies().Select(a => a.Name!).ToList();

            Assert.DoesNotContain(referenced, r => r.Equals("MediatR", StringComparison.OrdinalIgnoreCase));
            Assert.DoesNotContain(referenced, r => r.Equals("AutoMapper", StringComparison.OrdinalIgnoreCase));
            Assert.DoesNotContain(referenced, r => r.StartsWith("BuildingBlocks", StringComparison.OrdinalIgnoreCase));
            Assert.DoesNotContain(referenced, r => r.Equals("Microsoft.AspNetCore.Identity.EntityFrameworkCore", StringComparison.OrdinalIgnoreCase));
        }
    }

    [Fact]
    public void API_And_Modules_ShouldNotContain_MvcControllers()
    {
        var allTypes = ModuleAssemblies
            .Append(typeof(ApiSettings).Assembly)
            .SelectMany(a => a.GetTypes());

        var controllers = allTypes
            .Where(t => !t.IsAbstract && typeof(ControllerBase).IsAssignableFrom(t))
            .ToList();

        Assert.Empty(controllers);
    }

    [Fact]
    public void FastEndpoints_ShouldLiveInside_ModuleFeatureNamespaces()
    {
        var endpoints = ModuleAssemblies
            .SelectMany(a => a.GetTypes())
            .Where(t => !t.IsAbstract && typeof(IEndpoint).IsAssignableFrom(t))
            .ToList();

        Assert.NotEmpty(endpoints);
        Assert.All(endpoints, ep =>
        {
            Assert.NotNull(ep.Namespace);
            Assert.Contains(".Module.Features.", ep.Namespace);
        });
    }

    [Fact]
    public void EachStatefulModule_ShouldOwn_ItsOwn_DbContext()
    {
        var moduleDbContexts = ModuleAssemblies
            .SelectMany(a => a.GetTypes())
            .Where(t => !t.IsAbstract && typeof(DbContext).IsAssignableFrom(t))
            .ToList();

        var hostDbContexts = typeof(ApiSettings).Assembly
            .GetTypes()
            .Where(t => !t.IsAbstract && typeof(DbContext).IsAssignableFrom(t))
            .ToList();

        Assert.Equal(6, moduleDbContexts.Count);
        Assert.Empty(hostDbContexts);
    }

    [Fact]
    public void HangfireJobs_ShouldExistInExpectedModules_WithQueueAttributes()
    {
        Type[] expectedJobs =
        [
            typeof(SendEmailJob),
            typeof(SendUpcomingActivityRemindersJob),
            typeof(ExpireStalePendingOrdersJob),
            typeof(CleanupPaymentRecordsJob),
            typeof(CleanupOldNotificationsJob)
        ];

        Assert.All(expectedJobs, jobType =>
        {
            var queueAttr = jobType.GetCustomAttribute<QueueAttribute>();
            Assert.NotNull(queueAttr);
            Assert.False(string.IsNullOrWhiteSpace(queueAttr.Queue));
        });
    }

    [Fact]
    public void EachStatefulModule_ShouldProvide_ModuleSeeder()
    {
        var seeders = ModuleAssemblies
            .SelectMany(a => a.GetTypes())
            .Where(t => !t.IsAbstract && typeof(IModuleSeeder).IsAssignableFrom(t))
            .ToList();

        Assert.Equal(6, seeders.Count);
    }

    [Fact]
    public void AppRoles_ShouldInclude_Admin_Organizer_Moderator_And_User()
    {
        Assert.Contains(AppRoles.Admin, AppRoles.All);
        Assert.Contains(AppRoles.Organizer, AppRoles.All);
        Assert.Contains(AppRoles.Moderator, AppRoles.All);
        Assert.Contains(AppRoles.User, AppRoles.All);
    }
}
