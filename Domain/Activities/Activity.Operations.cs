using Domain.Common;

namespace Domain;

public partial class Activity
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
}
