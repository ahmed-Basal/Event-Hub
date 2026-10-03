namespace Application.Activities.DTO;

public class CreateActivityDto : BaseActivityDto
{
    public string Level { get; set; } = "All Levels";
    public List<string> Tags { get; set; } = [];
}
