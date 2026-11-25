using Payments.Module.Domain;

namespace Core.Tests;

public class PaymentReliabilityTests
{
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
