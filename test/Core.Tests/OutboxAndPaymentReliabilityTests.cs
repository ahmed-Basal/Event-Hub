using Domain;
using Domain.Events;
using Infrastructure.Outbox;

namespace Core.Tests;

public class OutboxAndPaymentReliabilityTests
{
    [Fact]
    public void OutboxMessage_FromDomainEvent_ShouldSerializeAndStartPending()
    {
        var domainEvent = new TicketOrderCreatedEvent("ord-1", "act-1", "user-1", 49.99m, "usd");

        var msg = OutboxMessage.FromDomainEvent(domainEvent);

        Assert.Equal(domainEvent.EventId, msg.Id);
        Assert.Equal(OutboxStatus.Pending, msg.Status);
        Assert.Contains("ord-1", msg.Content);
        Assert.Null(msg.ProcessedOnUtc);
    }

    [Fact]
    public void OutboxMessage_MarkRetryOrFailed_ShouldDeadLetterAfterMaxRetries()
    {
        var msg = OutboxMessage.FromDomainEvent(new TicketOrderFailedEvent("ord-2", "act-1", "user-1"));

        msg.MarkRetryOrFailed("transient error 1", maxRetries: 2);
        Assert.Equal(OutboxStatus.Pending, msg.Status);
        Assert.Equal(1, msg.RetryCount);
        Assert.NotNull(msg.NextRetryUtc);

        msg.MarkRetryOrFailed("transient error 2", maxRetries: 2);
        Assert.Equal(OutboxStatus.Failed, msg.Status);
        Assert.Equal(2, msg.RetryCount);
        Assert.Null(msg.NextRetryUtc);
        Assert.NotNull(msg.DeadLetteredOnUtc);
    }

    [Fact]
    public void OutboxMessage_ResolveEventType_ShouldResolveByFullNameAcrossAssemblies()
    {
        var domainEvent = new TicketOrderCreatedEvent("ord-99", "act-1", "user-1", 10m, "usd");
        var msg = OutboxMessage.FromDomainEvent(domainEvent);

        var resolved = OutboxMessage.ResolveEventType(msg.Type);

        Assert.Equal(typeof(TicketOrderCreatedEvent), resolved);
    }

    [Fact]
    public void IdempotencyRecord_Create_ShouldSetExpirationAndScopeKey()
    {
        var record = IdempotencyRecord.Create(" key-1 ", 200, "{\"ok\":true}", TimeSpan.FromMinutes(10));

        Assert.Equal("key-1", record.ScopeKey);
        Assert.Equal(200, record.StatusCode);
        Assert.True(record.ExpiresAtUtc > record.CreatedAtUtc);
    }

    [Fact]
    public void TicketOrder_MarkPaid_ShouldRejectInvalidStateTransition()
    {
        var order = TicketOrder.Create("act-1", "user-1", 25m, "usd");
        order.MarkFailed();

        Assert.Throws<InvalidOperationException>(() => order.MarkPaid("pi_123"));
    }

    [Fact]
    public void TicketOrder_MarkPaid_ShouldBeIdempotentWhenAlreadyPaid()
    {
        var order = TicketOrder.Create("act-1", "user-1", 25m, "usd");
        order.MarkPaid("pi_123");
        var paidAt = order.PaidAt;

        order.MarkPaid("pi_456");

        Assert.Equal(PaymentStatus.Paid, order.Status);
        Assert.Equal("pi_123", order.StripePaymentIntentId);
        Assert.Equal(paidAt, order.PaidAt);
    }

    [Fact]
    public void ProcessedWebhookEvent_Create_ShouldTrimValues()
    {
        var evt = ProcessedWebhookEvent.Create(" evt_123 ", " checkout.session.completed ", " ord-1 ");

        Assert.Equal("evt_123", evt.EventId);
        Assert.Equal("checkout.session.completed", evt.EventType);
        Assert.Equal("ord-1", evt.OrderId);
    }
}
