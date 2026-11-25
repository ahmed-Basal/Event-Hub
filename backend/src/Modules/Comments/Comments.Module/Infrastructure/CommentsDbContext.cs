using Comments.Module.Domain;
using DevMeet.Shared.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Comments.Module.Infrastructure;

public sealed class CommentsDbContext(
    DbContextOptions<CommentsDbContext> options,
    IDomainEventDispatcher? dispatcher = null) : DbContext(options)
{
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new CommentConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        if (dispatcher is not null)
            await dispatcher.DispatchAndClearAsync(this, cancellationToken);
        return result;
    }

    private sealed class CommentConfiguration : IEntityTypeConfiguration<Comment>
    {
        public void Configure(EntityTypeBuilder<Comment> builder)
        {
            builder.ToTable("Comments");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Body).IsRequired().HasMaxLength(2000);
            builder.Property(c => c.UserId).IsRequired();
            builder.Property(c => c.ActivityId).IsRequired();
            builder.HasIndex(c => new { c.ActivityId, c.CreatedAt });
        }
    }
}
