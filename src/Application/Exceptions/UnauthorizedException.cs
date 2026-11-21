namespace Core.Application.Exceptions;

/// <summary>
/// Exception thrown when authentication fails or an unauthenticated user attempts an operation.
/// Mapped to HTTP 401 (Unauthorized) in the API middleware.
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "Unauthorized access.") : base(message)
    {
    }
}
