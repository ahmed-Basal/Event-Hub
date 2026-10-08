using Domain.Common;

namespace Domain;

public partial class Activity
{
    public static Activity Create(
        string title,
        string description,
        string category,
        DateTime date,
        string city,
        string venue,
        double latitude,
        double longitude,
        string? image = null,
        string level = "All Levels",
        IEnumerable<string>? tags = null,
        string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title, nameof(title));

        var activity = new Activity
        {
            ID = id ?? Guid.NewGuid().ToString(),
            Title = title.Trim(),
            Slug = SlugHelper.GenerateSlug(title),
            Description = description?.Trim() ?? string.Empty,
            Category = category?.Trim() ?? string.Empty,
            Date = date,
            City = city?.Trim() ?? string.Empty,
            Venue = venue?.Trim() ?? string.Empty,
            Latitude = latitude,
            Longitude = longitude,
            Image = image?.Trim() ?? string.Empty,
            Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim(),
            IsCancelled = false
        };

        if (tags != null)
        {
            activity.SetTags(tags);
        }

        return activity;
    }
}
