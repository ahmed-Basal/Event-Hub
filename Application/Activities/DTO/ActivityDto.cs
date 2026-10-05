namespace Application.Activities.DTO;

public class ActivityDto : BaseActivityDto
{
    public string ID { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsCancelled { get; set; }
    public string Level { get; set; } = "All Levels";
    public List<string> Tags { get; set; } = [];
}
