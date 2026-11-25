using DevMeet.Shared.Events;
using Identity.Module.Domain;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Identity.Module.Infrastructure;

public sealed class IdentityDbContext(
    DbContextOptions<IdentityDbContext> options,
    IDomainEventDispatcher? dispatcher = null)
    : DbContext(options), IDataProtectionKeyContext
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfiguration(new AppUserConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        if (dispatcher is not null)
            await dispatcher.DispatchAndClearAsync(this, cancellationToken);
        return result;
    }

    private sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(u => u.Id);
            builder.Property(u => u.UserName).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
            builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(150);
            builder.Property(u => u.Bio).HasMaxLength(1000);
            builder.Property(u => u.Picture).HasMaxLength(1000);

            builder.Property<List<string>>("_roles")
                .HasField("_roles")
                .HasColumnName("Roles")
                .IsRequired();
            builder.Ignore(u => u.Roles);

            builder.HasIndex(u => u.UserName).IsUnique();
            builder.HasIndex(u => u.Email).IsUnique();
        }
    }
}
