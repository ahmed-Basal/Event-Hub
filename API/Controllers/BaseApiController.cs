using Application.Core;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected ActionResult HandleResult<T>(Result<T>? result)
    {
        if (result == null) return NotFound();

        if (!result.IsSuccess && result.Code == 404) return NotFound();
        if (!result.IsSuccess && result.Code == 401) return Unauthorized(result.Error);

        if (result.IsSuccess) return Ok(result.Value);

        return BadRequest(result.Error);
    }
}
