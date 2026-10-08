using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Persistence;

public static class ModulePersistenceDi
{
    public static IServiceCollection AddPersistenceDi(
        this IServiceCollection services,
        IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<DevMeetDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<DevMeetDbContext>());

        return services;
    }
}
