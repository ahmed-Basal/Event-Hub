namespace Core.Application.Exceptions;

/// <summary>
/// Exception thrown when a requested resource or entity is not found.
/// Mapped to HTTP 404 (Not Found) in the API middleware.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.")
    {
    }
}
