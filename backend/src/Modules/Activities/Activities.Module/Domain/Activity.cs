using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using DevMeet.Shared.Common;
using DevMeet.Shared.Events;

namespace Activities.Module.Domain;

public sealed partial class Activity : IHasDomainEvents
{
    private readonly List<string> _tags = [];
    private readonly List<ActivityAttendee> _attendees = [];
    private readonly List<ActivityWaitlistEntry> _waitlist = [];
    private readonly List<IDomainEvent> _domainEvents = [];

    private Activity() { }

    public string Id { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public DateTimeOffset Date { get; private set; } = DateTimeOffset.UtcNow;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public bool IsCancelled { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string Venue { get; private set; } = string.Empty;
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public string Image { get; private set; } = string.Empty;
    public string Level { get; private set; } = "All Levels";
    public decimal Price { get; private set; }
    public string Currency { get; private set; } = "usd";
    public int? MaxCapacity { get; private set; }
    public DateTimeOffset? ReminderSentAtUtc { get; private set; }

    public bool IsFull => MaxCapacity.HasValue && _attendees.Count >= MaxCapacity.Value;

    public IReadOnlyCollection<string> Tags => _tags.AsReadOnly();
    public IReadOnlyCollection<ActivityAttendee> Attendees => _attendees.AsReadOnly();
    public IReadOnlyCollection<ActivityWaitlistEntry> Waitlist => _waitlist.AsReadOnly();

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

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
        string currency = "usd",
        int? maxCapacity = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title, nameof(title));
        if (maxCapacity is <= 0)
            throw new ArgumentOutOfRangeException(nameof(maxCapacity), "MaxCapacity must be greater than zero when specified.");

        var activity = new Activity
        {
            Id = string.IsNullOrWhiteSpace(id) ? Guid.NewGuid().ToString() : id.Trim(),
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
            MaxCapacity = maxCapacity,
            IsCancelled = false
        };

        if (tags != null) activity.SetTags(tags);
        activity._domainEvents.Add(new ActivityCreatedEvent(activity.Id, activity.Title));
        return activity;
    }

    public void ClearDomainEvents() => _domainEvents.Clear();

    public static string GenerateSlug(string? title) => SlugHelper.GenerateSlug(title);
}
