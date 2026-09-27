namespace Application.Activities.DTO;

public class EditActivityDto : BaseActivityDto
{
    public string? Id { get; set; }
    public string Level { get; set; } = "All Levels";
    public List<string> Tags { get; set; } = [];
    public bool IsCancelled { get; set; }
}
