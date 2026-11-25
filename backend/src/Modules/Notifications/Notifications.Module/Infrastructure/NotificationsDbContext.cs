using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Notifications.Module.Domain;

namespace Notifications.Module.Infrastructure;

public sealed class NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : DbContext(options)
{
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new NotificationConfiguration());
    }

    private sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");
            builder.HasKey(n => n.Id);
            builder.Property(n => n.RecipientId).IsRequired();
            builder.Property(n => n.Message).IsRequired().HasMaxLength(500);
            builder.Property(n => n.Type).HasConversion<string>().HasMaxLength(50);
            builder.HasIndex(n => new { n.RecipientId, n.IsRead, n.CreatedAt });
        }
    }
}
