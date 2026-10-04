using Domain.Common;

namespace Domain;

public class Activity
{

    public string ID { get; private set; } = Guid.NewGuid().ToString();
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public DateTime Date { get; private set; } = DateTime.UtcNow;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public bool IsCancelled { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string Venue { get; private set; } = string.Empty;
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public string Image { get; private set; } = string.Empty;
    public string Level { get; private set; } = "All Levels";
    public List<string> Tags { get; private set; } = [];

    private Activity() { }

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

    public void UpdateTitle(string newTitle)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newTitle, nameof(newTitle));
        Title = newTitle.Trim();
        Slug = SlugHelper.GenerateSlug(newTitle);
    }

    public void UpdateImage(string? image)
    {
        Image = image?.Trim() ?? string.Empty;
    }

    public void UpdateDetails(
        string title,
        string description,
        string category,
        DateTime date,
        string level,
        string? image = null,
        IEnumerable<string>? tags = null)
    {
        UpdateTitle(title);
        Description = description?.Trim() ?? string.Empty;
        Category = category?.Trim() ?? string.Empty;
        Date = date;
        Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim();

        if (image != null)
        {
            UpdateImage(image);
        }

        if (tags != null)
        {
            SetTags(tags);
        }
    }

    public void UpdateLocation(string city, string venue, double latitude, double longitude)
    {
        City = city?.Trim() ?? string.Empty;
        Venue = venue?.Trim() ?? string.Empty;
        Latitude = latitude;
        Longitude = longitude;
    }

    public void Cancel()
    {
        IsCancelled = true;
    }

    public void Reactivate()
    {
        IsCancelled = false;
    }

    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        if (!Tags.Contains(clean, StringComparer.OrdinalIgnoreCase))
        {
            Tags.Add(clean);
        }
    }

    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        Tags.RemoveAll(t => t.Equals(clean, StringComparison.OrdinalIgnoreCase));
    }

    public void SetTags(IEnumerable<string> tags)
    {
        Tags.Clear();
        foreach (var tag in tags)
        {
            AddTag(tag);
        }
    }
}
