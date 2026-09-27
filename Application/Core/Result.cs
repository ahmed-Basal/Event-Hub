namespace Application.Core;

public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Value { get; set; }
    public string? Error { get; set; }
    public int Code { get; set; }

    public static Result<T> Success(T value) => new() { IsSuccess = true, Value = value };
    public static Result<T> Failure(string error, int code = 400) => new()
    {
        IsSuccess = false,
        Error = error,
        Code = code
    };
    public static Result<T> NotFound(string error = "Not found") => Failure(error, 404);
}
 