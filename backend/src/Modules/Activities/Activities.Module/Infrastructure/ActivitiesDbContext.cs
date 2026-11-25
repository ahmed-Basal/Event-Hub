using Activities.Module.Domain;
using DevMeet.Shared.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Activities.Module.Infrastructure;

public sealed class ActivitiesDbContext(
    DbContextOptions<ActivitiesDbContext> options,
    IDomainEventDispatcher? dispatcher = null) : DbContext(options)
{
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ActivityAttendee> ActivityAttendees => Set<ActivityAttendee>();
    public DbSet<ActivityWaitlistEntry> ActivityWaitlistEntries => Set<ActivityWaitlistEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new ActivityConfiguration());
        modelBuilder.ApplyConfiguration(new ActivityAttendeeConfiguration());
        modelBuilder.ApplyConfiguration(new ActivityWaitlistConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        if (dispatcher is not null)
            await dispatcher.DispatchAndClearAsync(this, cancellationToken);
        return result;
    }

    private sealed class ActivityConfiguration : IEntityTypeConfiguration<Activity>
    {
        public void Configure(EntityTypeBuilder<Activity> builder)
        {
            builder.ToTable("Activities");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).HasColumnName("ID");

            builder.Property(a => a.Title).IsRequired();
            builder.Property(a => a.Slug).IsRequired();
            builder.Property(a => a.Description).IsRequired();
            builder.Property(a => a.Category).IsRequired();
            builder.Property(a => a.City).IsRequired();
            builder.Property(a => a.Venue).IsRequired();
            builder.Property(a => a.Level).IsRequired();
            builder.Property(a => a.Image).IsRequired();
            builder.Property<List<string>>("_tags")
                .HasField("_tags")
                .HasColumnName("Tags")
                .IsRequired();
            builder.Ignore(a => a.Tags);

            builder.HasMany(a => a.Attendees)
                .WithOne(aa => aa.Activity)
                .HasForeignKey(aa => aa.ActivityId);
            builder.Navigation(a => a.Attendees).UsePropertyAccessMode(PropertyAccessMode.Field);

            builder.HasMany(a => a.Waitlist)
                .WithOne(w => w.Activity)
                .HasForeignKey(w => w.ActivityId);
            builder.Navigation(a => a.Waitlist).UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }

    private sealed class ActivityAttendeeConfiguration : IEntityTypeConfiguration<ActivityAttendee>
    {
        public void Configure(EntityTypeBuilder<ActivityAttendee> builder)
        {
            builder.ToTable("ActivityAttendees");
            builder.HasKey(aa => new { aa.ActivityId, aa.UserId });

            builder.HasOne(aa => aa.Activity)
                .WithMany(a => a.Attendees)
                .HasForeignKey(aa => aa.ActivityId);
        }
    }

    private sealed class ActivityWaitlistConfiguration : IEntityTypeConfiguration<ActivityWaitlistEntry>
    {
        public void Configure(EntityTypeBuilder<ActivityWaitlistEntry> builder)
        {
            builder.ToTable("ActivityWaitlistEntries");
            builder.HasKey(w => new { w.ActivityId, w.UserId });
            builder.HasIndex(w => new { w.ActivityId, w.JoinedAtUtc });

            builder.HasOne(w => w.Activity)
                .WithMany(a => a.Waitlist)
                .HasForeignKey(w => w.ActivityId);
        }
    }
}
