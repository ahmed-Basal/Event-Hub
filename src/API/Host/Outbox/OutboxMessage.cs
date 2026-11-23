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

    public static OutboxMessage FromDomainEvent(IDomainEvent domainEvent)
    {
        var eventType = domainEvent.GetType();
        return new OutboxMessage
        {
            Id = domainEvent.EventId,
            Type = eventType.AssemblyQualifiedName ?? eventType.FullName ?? eventType.Name,
            Content = JsonSerializer.Serialize(domainEvent, eventType),
            OccurredOnUtc = domainEvent.OccurredOnUtc,
            Status = OutboxStatus.Pending
        };
    }

    public void MarkProcessed()
    {
        Status = OutboxStatus.Processed;
        ProcessedOnUtc = DateTimeOffset.UtcNow;
        Error = null;
    }

    public void MarkRetryOrFailed(string error, int maxRetries = 5)
    {
        RetryCount++;
        Error = error.Length > 2000 ? error[..2000] : error;

        if (RetryCount >= maxRetries)
        {
            Status = OutboxStatus.Failed;
            NextRetryUtc = null;
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

        builder.HasIndex(x => new { x.Status, x.NextRetryUtc, x.OccurredOnUtc });
    }
}
