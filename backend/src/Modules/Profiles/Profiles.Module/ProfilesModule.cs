using DevMeet.Shared.Events;
using DevMeet.Shared.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Profiles.Contracts;
using Profiles.Module.Domain;
using Profiles.Module.Features.Events;
using Profiles.Module.Infrastructure;

namespace Profiles.Module;

public static class ProfilesModule
{
    public static IServiceCollection AddProfilesModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<ProfilesDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddOptions<CloudinarySettings>().BindConfiguration(CloudinarySettings.SectionName);
        services.AddScoped<IPhotoAccessor, PhotoAccessor>();
        services.AddScoped<IProfilesDirectory, ProfilesDirectory>();
        services.AddScoped<IDomainEventHandler<UserFollowedEvent>, UserFollowedEventHandler>();
        services.AddScoped<IModuleSeeder, ProfilesSeeder>();

        return services;
    }
}
