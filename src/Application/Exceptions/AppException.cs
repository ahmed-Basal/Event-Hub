namespace Core.Application.Exceptions;

public class AppException(
    int statusCode,
    string message,
    string? details = null,
    string? traceId = null,
    string? path = null,
    string? method = null,
    DateTimeOffset? timestamp = null)
{
    public int StatusCode { get; set; } = statusCode;
    public string Message { get; set; } = message;
    public string? Details { get; set; } = details;
    public string? TraceId { get; set; } = traceId;
    public string? Path { get; set; } = path;
    public string? Method { get; set; } = method;
    public DateTimeOffset Timestamp { get; set; } = timestamp ?? DateTimeOffset.UtcNow;
}
