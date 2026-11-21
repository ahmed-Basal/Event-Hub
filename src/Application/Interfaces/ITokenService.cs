using Core.Domain;

namespace Core.Application.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
    RefreshToken GenerateRefreshToken(string userId, string? ipAddress = null);
}
