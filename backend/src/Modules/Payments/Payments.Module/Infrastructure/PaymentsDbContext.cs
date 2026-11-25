using DevMeet.Shared.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Payments.Module.Domain;

namespace Payments.Module.Infrastructure;

public sealed class PaymentsDbContext(
    DbContextOptions<PaymentsDbContext> options,
    IDomainEventDispatcher? dispatcher = null) : DbContext(options)
{
    public DbSet<TicketOrder> TicketOrders => Set<TicketOrder>();
    public DbSet<ProcessedWebhookEvent> ProcessedWebhookEvents => Set<ProcessedWebhookEvent>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new TicketOrderConfiguration());
        modelBuilder.ApplyConfiguration(new ProcessedWebhookEventConfiguration());
        modelBuilder.ApplyConfiguration(new IdempotencyRecordConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var result = await base.SaveChangesAsync(cancellationToken);
        if (dispatcher is not null)
            await dispatcher.DispatchAndClearAsync(this, cancellationToken);
        return result;
    }

    private sealed class TicketOrderConfiguration : IEntityTypeConfiguration<TicketOrder>
    {
        public void Configure(EntityTypeBuilder<TicketOrder> builder)
        {
            builder.ToTable("TicketOrders");
            builder.HasKey(o => o.Id);
            builder.Property(o => o.ActivityId).IsRequired();
            builder.Property(o => o.UserId).IsRequired();
            builder.Property(o => o.Amount).HasPrecision(18, 2);
            builder.Property(o => o.Currency).HasMaxLength(10).IsRequired();
            builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(30);
            builder.Property(o => o.CheckInCode).HasMaxLength(32);
            builder.Property(o => o.CheckedInByUserId).HasMaxLength(128);
            builder.HasIndex(o => o.StripeSessionId);
            builder.HasIndex(o => o.CheckInCode).IsUnique();
            builder.HasIndex(o => new { o.UserId, o.ActivityId });
            builder.Property<uint>("xmin").IsRowVersion();
        }
    }

    private sealed class ProcessedWebhookEventConfiguration : IEntityTypeConfiguration<ProcessedWebhookEvent>
    {
        public void Configure(EntityTypeBuilder<ProcessedWebhookEvent> builder)
        {
            builder.ToTable("ProcessedWebhookEvents");
            builder.HasKey(e => e.EventId);
            builder.Property(e => e.EventId).HasMaxLength(255).IsRequired();
            builder.Property(e => e.EventType).HasMaxLength(100).IsRequired();
            builder.Property(e => e.OrderId).HasMaxLength(100);
            builder.HasIndex(e => e.ProcessedAtUtc);
        }
    }

    private sealed class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
    {
        public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
        {
            builder.ToTable("IdempotencyRecords");
            builder.HasKey(x => x.ScopeKey);
            builder.Property(x => x.ScopeKey).HasMaxLength(350).IsRequired();
            builder.Property(x => x.ResponseJson).IsRequired();
            builder.HasIndex(x => x.ExpiresAtUtc);
        }
    }
}
