using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    private IMediator? _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>()??throw new InvalidOperationException("Mediator not found");


    protected ActionResult HandleResult<T>(Result<T> result)
    {
       
        if (!result.IsSuccess && result.Error.Code == 404) return NotFound();

        if (result.IsSuccess) return result.Value;

        return BadRequest(result.Error);
    }
}
