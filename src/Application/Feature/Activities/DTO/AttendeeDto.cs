namespace Application.Feature.Activities.DTO;

public class AttendeeDto
{
    public required string Username { get; set; }
    public required string DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? Image { get; set; }
    public bool IsHost { get; set; }
}
