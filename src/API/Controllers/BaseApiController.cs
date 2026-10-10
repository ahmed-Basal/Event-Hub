using Core.Application.Bases;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Abstract foundational controller encapsulating standardized HTTP response mapping and routing conventions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Transforms the standardized internal <see cref="Response{T}"/> domain result into the appropriate <see cref="ActionResult"/>.
    /// </summary>
    /// <typeparam name="T">The type of the encapsulated payload.</typeparam>
    /// <param name="response">The domain operation response envelope.</param>
    /// <returns>A mapped ASP.NET Core <see cref="ActionResult"/> with corresponding HTTP status code.</returns>
    protected ActionResult NewResult<T>(Response<T>? response)
    {
        if (response == null) return NotFound();

        return response.StatusCode switch
        {
            System.Net.HttpStatusCode.OK => Ok(response),
            System.Net.HttpStatusCode.Created => Created(string.Empty, response),
            System.Net.HttpStatusCode.Unauthorized => Unauthorized(response),
            System.Net.HttpStatusCode.BadRequest => BadRequest(response),
            System.Net.HttpStatusCode.NotFound => NotFound(response),
            System.Net.HttpStatusCode.Accepted => Accepted(response),
            System.Net.HttpStatusCode.UnprocessableEntity => UnprocessableEntity(response),
            _ => BadRequest(response)
        };
    }
}
