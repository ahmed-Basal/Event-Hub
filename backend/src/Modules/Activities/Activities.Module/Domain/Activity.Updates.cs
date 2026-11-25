using DevMeet.Shared.Common;

namespace Activities.Module.Domain;

public sealed partial class Activity
{
    public void UpdateTitle(string newTitle)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newTitle, nameof(newTitle));
        Title = newTitle.Trim();
        Slug = SlugHelper.GenerateSlug(newTitle);
    }

    public void UpdateImage(string? image) => Image = image?.Trim() ?? string.Empty;

    public void UpdateDetails(
        string title,
        string description,
        string category,
        DateTimeOffset date,
        string level,
        string? image = null,
        IEnumerable<string>? tags = null,
        string? actorUserId = null)
    {
        UpdateTitle(title);
        Description = description?.Trim() ?? string.Empty;
        Category = category?.Trim() ?? string.Empty;
        Date = date.ToUniversalTime();
        Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim();
        if (image != null) UpdateImage(image);
        if (tags != null) SetTags(tags);

        _domainEvents.Add(new ActivityDetailsUpdatedEvent(Id, Title, actorUserId));
    }

    public void UpdateLocation(string city, string venue, double latitude, double longitude)
    {
        City = city?.Trim() ?? string.Empty;
        Venue = venue?.Trim() ?? string.Empty;
        Latitude = latitude;
        Longitude = longitude;
    }

    public void UpdatePricing(decimal price, string currency = "usd")
    {
        Price = Math.Max(0, price);
        Currency = string.IsNullOrWhiteSpace(currency) ? "usd" : currency.Trim().ToLowerInvariant();
    }

    public void UpdateCapacity(int? maxCapacity)
    {
        if (maxCapacity is <= 0)
            throw new ArgumentOutOfRangeException(nameof(maxCapacity), "MaxCapacity must be greater than zero.");

        MaxCapacity = maxCapacity;
    }

    public void MarkReminderSent()
    {
        ReminderSentAtUtc ??= DateTimeOffset.UtcNow;
    }

    public void Cancel(string? actorUserId = null)
    {
        if (IsCancelled) return;
        IsCancelled = true;
        _domainEvents.Add(new ActivityCancelledEvent(Id, Title, actorUserId));
    }

    public void Reactivate(string? actorUserId = null)
    {
        if (!IsCancelled) return;
        IsCancelled = false;
        _domainEvents.Add(new ActivityReactivatedEvent(Id, Title, actorUserId));
    }
}
