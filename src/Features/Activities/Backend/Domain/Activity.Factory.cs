using Domain.Common;
using Domain.Events;

namespace Domain;

public sealed partial class Activity
{
    public static Activity Create(
        string title,
        string description,
        string category,
        DateTimeOffset date,
        string city,
        string venue,
        double latitude,
        double longitude,
        string? image = null,
        string level = "All Levels",
        IEnumerable<string>? tags = null,
        string? id = null,
        decimal price = 0,
        string currency = "usd")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title, nameof(title));

        var activity = new Activity
        {
            ID = id ?? Guid.NewGuid().ToString(),
            Title = title.Trim(),
            Slug = SlugHelper.GenerateSlug(title),
            Description = description?.Trim() ?? string.Empty,
            Category = category?.Trim() ?? string.Empty,
            Date = date.ToUniversalTime(),
            City = city?.Trim() ?? string.Empty,
            Venue = venue?.Trim() ?? string.Empty,
            Latitude = latitude,
            Longitude = longitude,
            Image = image?.Trim() ?? string.Empty,
            Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim(),
            Price = Math.Max(0, price),
            Currency = string.IsNullOrWhiteSpace(currency) ? "usd" : currency.Trim().ToLowerInvariant(),
            IsCancelled = false
        };

        if (tags != null)
        {
            activity.SetTags(tags);
        }

        activity.AddDomainEvent(new ActivityCreatedEvent(activity.Id, activity.Title));

        return activity;
    }
}
