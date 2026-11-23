using System.Net;

namespace Application.Bases;

public class Response<T>
{
    public HttpStatusCode StatusCode { get; set; }
    public object? Meta { get; set; }
    public bool Succeeded { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }
    public T? Data { get; set; }

    public Response()
    {
    }

    public Response(T data, string? message = null)
    {
        Succeeded = true;
        Message = message;
        Data = data;
        StatusCode = HttpStatusCode.OK;
    }

    public Response(string message)
    {
        Succeeded = false;
        Message = message;
    }

    public Response(string message, bool succeeded)
    {
        Succeeded = succeeded;
        Message = message;
    }
}
