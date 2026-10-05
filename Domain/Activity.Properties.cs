namespace Domain;

public partial class Activity
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
}
