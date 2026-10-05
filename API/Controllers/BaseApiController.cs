using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    private IMediator? _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>() ?? throw new InvalidOperationException("Mediator not found");

    protected ActionResult HandleResult<T>(Result<T> result)
    {
        if (result == null) return NotFound();

        if (!result.IsSuccess && result.Code == 404) return NotFound();
        if (!result.IsSuccess && result.Code == 401) return Unauthorized(result.Error);

        if (result.IsSuccess) return Ok(result.Value);

        return BadRequest(result.Error);
    }
}
