using Domain;

namespace Application.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, IEnumerable<string>? roles = null);
    RefreshToken GenerateRefreshToken(string userId, string? ipAddress = null);
}
