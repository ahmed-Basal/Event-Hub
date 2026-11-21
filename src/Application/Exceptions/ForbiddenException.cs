namespace Core.Application.Exceptions;

/// <summary>
/// Exception thrown when an authenticated user attempts an operation they do not have authorization/permission to perform.
/// Mapped to HTTP 403 (Forbidden) in the API middleware.
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "You do not have permission to perform this action.") : base(message)
    {
    }
}
