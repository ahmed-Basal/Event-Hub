namespace Core.Application.Feature.Account.DTO;

public record RefreshTokenRequestDto
{
    public string? RefreshToken { get; init; }
}
