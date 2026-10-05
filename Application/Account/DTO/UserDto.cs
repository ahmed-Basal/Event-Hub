namespace Application.Account.DTO;

public class UserDto
{
    public required string DisplayName { get; set; }
    public required string Token { get; set; }
    public required string Username { get; set; }
    public string? Image { get; set; }
}
