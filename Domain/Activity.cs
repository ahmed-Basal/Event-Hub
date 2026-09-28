using Domain.Common;

namespace Domain;

/// <summary>
/// Rich Domain Model representing a developer activity / meetup.
/// Encapsulates all state mutations, invariants, and business rules.
/// </summary>
public class Activity
{
    // ── 1. Encapsulated Properties (Private Setters) ───────────────────
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
    public string Level { get; private set; } = "All Levels";
    public List<string> Tags { get; private set; } = [];

    // ── 2. Parameterless constructor for EF Core ───────────────────────
    private Activity() { }

    // ── 3. Factory Method (Enforces valid creation invariants) ──────────
    public static Activity Create(
        string title,
        string description,
        string category,
        DateTime date,
        string city,
        string venue,
        double latitude,
        double longitude,
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
            Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim(),
            IsCancelled = false
        };

        if (tags != null)
        {
            activity.SetTags(tags);
        }

        return activity;
    }

    // ── 4. Domain Behaviors & Business Methods ─────────────────────────

    /// <summary>
    /// Updates the event title and automatically recalculates the URL slug.
    /// </summary>
    public void UpdateTitle(string newTitle)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newTitle, nameof(newTitle));
        Title = newTitle.Trim();
        Slug = SlugHelper.GenerateSlug(newTitle);
    }

    /// <summary>
    /// Updates the core event details and synchronizes the slug if title changed.
    /// </summary>
    public void UpdateDetails(
        string title,
        string description,
        string category,
        DateTime date,
        string level,
        IEnumerable<string>? tags = null)
    {
        UpdateTitle(title);
        Description = description?.Trim() ?? string.Empty;
        Category = category?.Trim() ?? string.Empty;
        Date = date;
        Level = string.IsNullOrWhiteSpace(level) ? "All Levels" : level.Trim();

        if (tags != null)
        {
            SetTags(tags);
        }
    }

    /// <summary>
    /// Updates event venue and geographical coordinates.
    /// </summary>
    public void UpdateLocation(string city, string venue, double latitude, double longitude)
    {
        City = city?.Trim() ?? string.Empty;
        Venue = venue?.Trim() ?? string.Empty;
        Latitude = latitude;
        Longitude = longitude;
    }

    /// <summary>
    /// Cancels the scheduled activity.
    /// </summary>
    public void Cancel()
    {
        IsCancelled = true;
    }

    /// <summary>
    /// Reactivates a previously cancelled activity.
    /// </summary>
    public void Reactivate()
    {
        IsCancelled = false;
    }

    /// <summary>
    /// Adds a topic tag if not already present.
    /// </summary>
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        if (!Tags.Contains(clean, StringComparer.OrdinalIgnoreCase))
        {
            Tags.Add(clean);
        }
    }

    /// <summary>
    /// Removes a topic tag.
    /// </summary>
    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        Tags.RemoveAll(t => t.Equals(clean, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Replaces the tag collection with a new unique set.
    /// </summary>
    public void SetTags(IEnumerable<string> tags)
    {
        Tags.Clear();
        foreach (var tag in tags)
        {
            AddTag(tag);
        }
    }
}
