using Comments.Module.Domain;
using Comments.Module.Features;
using Comments.Module.Features.Events;
using Comments.Module.Infrastructure;
using DevMeet.Shared.Events;
using DevMeet.Shared.Seeding;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Comments.Module;

public static class CommentsModule
{
    public static IServiceCollection AddCommentsModule(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")
            ?? config.GetSection("ConnectionStrings:DefaultConnection").Value;

        services.AddDbContext<CommentsDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

        services.AddScoped<IDomainEventHandler<CommentCreatedEvent>, CommentCreatedEventHandler>();
        services.AddScoped<IModuleSeeder, CommentsSeeder>();

        return services;
    }

    public static IEndpointRouteBuilder MapCommentsModule(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHub<CommentHub>("/comments");
        return endpoints;
    }
}
