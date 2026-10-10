using System.Net;

namespace Application.Bases;

public class ResponseHandler
{
    public Response<T> Success<T>(T entity, object? meta = null)
    {
        return new Response<T>
        {
            Data = entity,
            StatusCode = HttpStatusCode.OK,
            Succeeded = true,
            Message = "Completed Successfully",
            Meta = meta
        };
    }

    public Response<T> Unauthorized<T>(string? message = null)
    {
        return new Response<T>
        {
            StatusCode = HttpStatusCode.Unauthorized,
            Succeeded = false,
            Message = message ?? "Unauthorized"
        };
    }

    public Response<T> BadRequest<T>(string? message = null, List<string>? errors = null)
    {
        return new Response<T>
        {
            StatusCode = HttpStatusCode.BadRequest,
            Succeeded = false,
            Message = message ?? "Bad Request",
            Errors = errors
        };
    }

    public Response<T> NotFound<T>(string? message = null)
    {
        return new Response<T>
        {
            StatusCode = HttpStatusCode.NotFound,
            Succeeded = false,
            Message = message ?? "Not Found"
        };
    }

    public Response<T> Created<T>(T entity, object? meta = null)
    {
        return new Response<T>
        {
            Data = entity,
            StatusCode = HttpStatusCode.Created,
            Succeeded = true,
            Message = "Created Successfully",
            Meta = meta
        };
    }

    public Response<T> Deleted<T>(string? message = null)
    {
        return new Response<T>
        {
            StatusCode = HttpStatusCode.OK,
            Succeeded = true,
            Message = message ?? "Deleted Successfully"
        };
    }

    public Response<T> UnprocessableEntity<T>(string? message = null, List<string>? errors = null)
    {
        return new Response<T>
        {
            StatusCode = HttpStatusCode.UnprocessableEntity,
            Succeeded = false,
            Message = message ?? "Unprocessable Entity",
            Errors = errors
        };
    }
}
