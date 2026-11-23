using Domain;

namespace Application.Interfaces;

public interface IUserAccessor
{
    string? GetEmail();
    string? GetUsername();
    string GetUserId();
    string? GetUserIdOrNull();
    Task<User> GetUserAsync();
    string? GetIpAddress();
    string? GetRefreshToken();
}
