using Application.Common.Events;
using Application.Interfaces;
using Domain;
using Domain.Common;
using Infrastructure.Outbox;
using MediatR;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class DevMeetDbContext(
    DbContextOptions<DevMeetDbContext> options,
    IPublisher? publisher = null,
    IOutboxWakeup? outboxWakeup = null)
    : IdentityDbContext<User>(options), IDataProtectionKeyContext, IAppDbContext
{
    public DbSet<Activity> Activities { get; set; } = null!;
    public DbSet<ActivityAttendee> ActivityAttendees { get; set; } = null!;
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<UserFollowing> UserFollowings { get; set; } = null!;
    public DbSet<Photo> Photos { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<TicketOrder> TicketOrders { get; set; } = null!;
    public DbSet<ProcessedWebhookEvent> ProcessedWebhookEvents { get; set; } = null!;
    public DbSet<IdempotencyRecord> IdempotencyRecords { get; set; } = null!;
    public DbSet<OutboxMessage> OutboxMessages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(DevMeetDbContext).Assembly);
    }

    /// <summary>
    /// Clears all pending domain events from tracked entities (useful during database seeding).
    /// </summary>
    public void ClearAllDomainEvents()
    {
        foreach (var entry in ChangeTracker.Entries<IHasDomainEvents>())
        {
            entry.Entity.ClearDomainEvents();
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var domainEvents = CollectAndClearDomainEvents();

        if (outboxWakeup is not null && domainEvents.Count > 0)
        {
            foreach (var domainEvent in domainEvents)
            {
                OutboxMessages.Add(OutboxMessage.FromDomainEvent(domainEvent));
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        if (outboxWakeup is not null && domainEvents.Count > 0)
        {
            outboxWakeup.Signal();
        }
        else if (publisher is not null && domainEvents.Count > 0)
        {
            await DispatchDomainEventsAsync(domainEvents, cancellationToken);
        }

        return result;
    }

    private List<IDomainEvent> CollectAndClearDomainEvents()
    {
        var entitiesWithEvents = ChangeTracker
            .Entries<IHasDomainEvents>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        var events = entitiesWithEvents
            .SelectMany(e => e.DomainEvents)
            .ToList();

        foreach (var entity in entitiesWithEvents)
        {
            entity.ClearDomainEvents();
        }

        return events;
    }

    private async Task DispatchDomainEventsAsync(
        IReadOnlyCollection<IDomainEvent> domainEvents,
        CancellationToken cancellationToken)
    {
        foreach (var domainEvent in domainEvents)
        {
            var notificationType = typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType());
            var notification = (INotification)Activator.CreateInstance(notificationType, domainEvent)!;
            await publisher!.Publish(notification, cancellationToken);
        }
    }
}
