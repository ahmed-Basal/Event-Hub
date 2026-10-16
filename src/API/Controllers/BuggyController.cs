using System.ComponentModel.DataAnnotations;
using Core.Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Controller used for testing exception handling and HTTP error status codes.
/// Exposes endpoints for 400, 401, 403, 404, 500, Bad GUID, and Validation Errors.
/// </summary>
public class BuggyController : BaseApiController
{
    /// <summary>
    /// Simulates a 404 Not Found error by throwing a NotFoundException.
    /// </summary>
    [HttpGet("not-found")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult GetNotFound()
    {
        throw new NotFoundException("This resource could not be found.");
    }

    /// <summary>
    /// Simulates a 400 Bad Request error by throwing a BadRequestException.
    /// </summary>
    [HttpGet("bad-request")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult GetBadRequest()
    {
        throw new BadRequestException("This is a bad request exception.");
    }

    /// <summary>
    /// Simulates a 500 Internal Server Error by throwing an unhandled exception.
    /// </summary>
    [HttpGet("server-error")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult GetServerError()
    {
        throw new Exception("This is a simulated internal server error.");
    }

    /// <summary>
    /// Simulates a 401 Unauthorized error by throwing an UnauthorizedException.
    /// </summary>
    [HttpGet("unauthorised")]
    [HttpGet("unauthorized")]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult GetUnauthorized()
    {
        throw new UnauthorizedException("You are not authorized to perform this action.");
    }

    /// <summary>
    /// Simulates a 403 Forbidden error by throwing a ForbiddenException.
    /// </summary>
    [HttpGet("forbidden")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public ActionResult GetForbidden()
    {
        throw new ForbiddenException("You do not have permission to access this resource.");
    }

    /// <summary>
    /// Simulates a 400 Bad Request error caused by invalid route GUID binding.
    /// </summary>
    [HttpGet("bad-guid/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult GetBadGuid(Guid id)
    {
        return Ok(new { message = $"Valid GUID received: {id}" });
    }

    /// <summary>
    /// Simulates a 400 Validation Error returning standard model state validation errors.
    /// </summary>
    [HttpPost("validation-error")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult PostValidationError([FromBody] BuggyValidationRequestDto dto)
    {
        return Ok(new { message = "Validation passed", data = dto });
    }
}

public class BuggyValidationRequestDto
{
    [Required(ErrorMessage = "The Title field is required.")]
    [MinLength(5, ErrorMessage = "The Title field must be at least 5 characters long.")]
    public string? Title { get; set; }

    [Required(ErrorMessage = "The Category field is required.")]
    public string? Category { get; set; }
}
