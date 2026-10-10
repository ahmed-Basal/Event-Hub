namespace Core.Application.Feature.Account.DTO;

public record UserDto
{
    public required string Id { get; init; }
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public string? Image { get; init; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
}
