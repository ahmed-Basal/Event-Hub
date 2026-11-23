namespace BuildingBlocks.Contracts;

/// <summary>
/// Lightweight identity port for the currently authenticated principal.
/// Decouples feature modules from Account's User entity and ASP.NET HttpContext.
/// </summary>
public interface ICurrentUser
{
    string? UserId { get; }
    string? Username { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
