using System.Text.Json;
using Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Outbox;

public enum OutboxStatus
{
    Pending = 0,
    Processed = 1,
    Failed = 2
}

public sealed class OutboxMessage
{
    private OutboxMessage() { }

    public Guid Id { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public DateTimeOffset OccurredOnUtc { get; private set; }
    public DateTimeOffset? ProcessedOnUtc { get; private set; }
    public OutboxStatus Status { get; private set; } = OutboxStatus.Pending;
    public int RetryCount { get; private set; }
    public DateTimeOffset? NextRetryUtc { get; private set; }
    public string? Error { get; private set; }
    public string? ClaimedBy { get; private set; }
    public DateTimeOffset? ClaimedAtUtc { get; private set; }
    public DateTimeOffset? DeadLetteredOnUtc { get; private set; }

    public static OutboxMessage FromDomainEvent(IDomainEvent domainEvent)
    {
        var eventType = domainEvent.GetType();
        return new OutboxMessage
        {
            Id = domainEvent.EventId,
            Type = eventType.FullName ?? eventType.AssemblyQualifiedName ?? eventType.Name,
            Content = JsonSerializer.Serialize(domainEvent, eventType),
            OccurredOnUtc = domainEvent.OccurredOnUtc,
            Status = OutboxStatus.Pending
        };
    }

    public static Type? ResolveEventType(string typeName)
    {
        if (string.IsNullOrWhiteSpace(typeName)) return null;

        var direct = System.Type.GetType(typeName);
        if (direct is not null) return direct;

        var simpleName = typeName.Split(',')[0].Trim();
        foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
        {
            var resolved = assembly.GetType(simpleName);
            if (resolved is not null) return resolved;
        }

        return null;
    }

    public void MarkProcessed()
    {
        Status = OutboxStatus.Processed;
        ProcessedOnUtc = DateTimeOffset.UtcNow;
        Error = null;
        ClaimedBy = null;
        ClaimedAtUtc = null;
    }

    public void MarkRetryOrFailed(string error, int maxRetries = 5)
    {
        RetryCount++;
        Error = error.Length > 2000 ? error[..2000] : error;
        ClaimedBy = null;
        ClaimedAtUtc = null;

        if (RetryCount >= maxRetries)
        {
            Status = OutboxStatus.Failed;
            NextRetryUtc = null;
            DeadLetteredOnUtc = DateTimeOffset.UtcNow;
        }
        else
        {
            var delaySeconds = Math.Pow(2, RetryCount) * 5;
            NextRetryUtc = DateTimeOffset.UtcNow.AddSeconds(delaySeconds);
        }
    }
}

public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Content).IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Error).HasMaxLength(2000);
        builder.Property(x => x.ClaimedBy).HasMaxLength(100);

        builder.HasIndex(x => new { x.Status, x.NextRetryUtc, x.OccurredOnUtc });
        builder.HasIndex(x => x.ClaimedAtUtc);
    }
}
