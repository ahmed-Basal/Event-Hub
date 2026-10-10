namespace Application.Feature.Account.DTO;

public record RegisterDto
{
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}
