using Domain.Events;

namespace Domain;

public sealed partial class Activity
{
    public void Cancel(string? actorUserId = null)
    {
        if (IsCancelled) return;

        IsCancelled = true;
        AddDomainEvent(new ActivityCancelledEvent(Id, Title, actorUserId));
    }

    public void Reactivate(string? actorUserId = null)
    {
        if (!IsCancelled) return;

        IsCancelled = false;
        AddDomainEvent(new ActivityReactivatedEvent(Id, Title, actorUserId));
    }

    public void UpdatePricing(decimal price, string currency = "usd")
    {
        Price = Math.Max(0, price);
        Currency = string.IsNullOrWhiteSpace(currency) ? "usd" : currency.Trim().ToLowerInvariant();
    }
}
