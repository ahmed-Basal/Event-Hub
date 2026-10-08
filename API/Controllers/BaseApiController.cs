using Application.Bases;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
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
