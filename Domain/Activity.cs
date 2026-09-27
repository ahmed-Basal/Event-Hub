using Domain.Common;

namespace Domain;

public class Activity
{
    private string _title = string.Empty;

    public string ID { get; set; } = Guid.NewGuid().ToString();

    public string Title
    {
        get => _title;
        set
        {
            _title = value;
            Slug = SlugHelper.GenerateSlug(value);
        }
    }

    public string Slug { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsCancelled { get; set; } = false;
    public string City { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Level { get; set; } = "All Levels"; // Beginner, Intermediate, Advanced
    public List<string> Tags { get; set; } = [];
}
