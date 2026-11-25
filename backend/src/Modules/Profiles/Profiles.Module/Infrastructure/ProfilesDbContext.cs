using DevMeet.Shared.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Profiles.Module.Domain;

namespace Profiles.Module.Infrastructure;

public sealed class ProfilesDbContext(
    DbContextOptions<ProfilesDbContext> options,
    IDomainEventDispatcher? dispatcher = null) : DbContext(options)
{
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<UserFollowing> UserFollowings => Set<UserFollowing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new PhotoConfiguration());
        modelBuilder.ApplyConfiguration(new UserFollowingConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        if (dispatcher is not null)
            await dispatcher.DispatchAndClearAsync(this, cancellationToken);
        return result;
    }

    private sealed class PhotoConfiguration : IEntityTypeConfiguration<Photo>
    {
        public void Configure(EntityTypeBuilder<Photo> builder)
        {
            builder.ToTable("Photos");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Url).IsRequired();
            builder.Property(p => p.UserId).IsRequired();
            builder.HasIndex(p => p.UserId);
        }
    }

    private sealed class UserFollowingConfiguration : IEntityTypeConfiguration<UserFollowing>
    {
        public void Configure(EntityTypeBuilder<UserFollowing> builder)
        {
            builder.ToTable("UserFollowings");
            builder.HasKey(uf => new { uf.ObserverId, uf.TargetId });
            builder.HasIndex(uf => uf.TargetId);
        }
    }
}
