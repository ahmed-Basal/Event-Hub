using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Activity> Activities { get; set; }
    DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    DbSet<User> Users { get; set; }
    DbSet<IdentityRole> Roles { get; set; }
    DbSet<IdentityUserRole<string>> UserRoles { get; set; }
    DbSet<RefreshToken> RefreshTokens { get; set; }
    DbSet<Photo> Photos { get; set; }
    DbSet<Comment> Comments { get; set; }
    DbSet<UserFollowing> UserFollowings { get; set; }
    DbSet<Notification> Notifications { get; set; }
    DbSet<TicketOrder> TicketOrders { get; set; }
    DbSet<ProcessedWebhookEvent> ProcessedWebhookEvents { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
