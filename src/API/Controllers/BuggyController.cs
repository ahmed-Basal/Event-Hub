#if DEBUG
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Development-only controller used for testing exception handling and HTTP error status codes.
/// Excluded from production API documentation.
/// </summary>
[ApiExplorerSettings(IgnoreApi = true)]
public class BuggyController : BaseApiController
{
    [HttpGet("not-found")]
    public ActionResult GetNotFound()
    {
        return NotFound();
    }

    [HttpGet("bad-request")]
    public ActionResult GetBadRequest()
    {
        return BadRequest("This is a bad request");
    }

    [HttpGet("server-error")]
    public ActionResult GetServerError()
    {
        throw new Exception("This is a server error");
    }

    [HttpGet("unauthorised")]
    [HttpGet("unauthorized")]
    public ActionResult GetUnauthorized()
    {
        return Unauthorized();
    }
}
#endif
