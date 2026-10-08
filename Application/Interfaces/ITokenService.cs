using Domain;

namespace Application.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
    RefreshToken GenerateRefreshToken(string userId, string? ipAddress = null);
}
