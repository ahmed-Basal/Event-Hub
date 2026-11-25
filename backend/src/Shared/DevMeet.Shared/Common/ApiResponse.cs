using System.Net;

namespace DevMeet.Shared.Common;

public sealed record ApiResponse<T>(
    HttpStatusCode StatusCode,
    bool Succeeded,
    string? Message,
    T? Data,
    object? Meta = null,
    List<string>? Errors = null)
{
    public static ApiResponse<T> Ok(T data, string? message = null, object? meta = null)
        => new(HttpStatusCode.OK, true, message, data, meta);

    public static ApiResponse<T> Fail(HttpStatusCode code, string message, List<string>? errors = null)
        => new(code, false, message, default, null, errors);
}
