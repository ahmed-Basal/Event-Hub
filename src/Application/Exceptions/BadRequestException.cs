namespace Core.Application.Exceptions;

/// <summary>
/// Exception thrown when a client request violates business invariants or validation rules.
/// Mapped to HTTP 400 (Bad Request) in the API middleware.
/// </summary>
public class BadRequestException : Exception
{
    public List<string>? Errors { get; }

    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, List<string> errors) : base(message)
    {
        Errors = errors;
    }
}
