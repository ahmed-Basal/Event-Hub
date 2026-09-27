namespace Application.Activities.DTO;

public class EditActivityDto : BaseActivityDto
{
    public string? ID { get; set; }
    public string Level { get; set; } = "All Levels";
    public List<string> Tags { get; set; } = [];
    public bool IsCancelled { get; set; }
}
