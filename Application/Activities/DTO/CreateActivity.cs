namespace Application.Activities.DTO;

public class CreateActivityDto : BaseActivityDto
{
    public string Level { get; set; } = "All Levels"; // Beginner, Intermediate, Advanced, All Levels
    public List<string> Tags { get; set; } = [];
}
