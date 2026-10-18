using Core.Application.Feature.Activities.Commands.CreateActivity;
using Core.Application.Feature.Activities.Commands.DeleteActivity;
using Core.Application.Feature.Activities.Commands.EditActivity;
using Core.Application.Feature.Activities.Queries.GetActivityDetails;
using Core.Application.Feature.Activities.Queries.GetActivityList;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Manages tech meetup events, workshops, conferences, and attendee RSVPs across Egyptian tech communities.
/// </summary>
public class ActivitiesController(ISender mediator) : BaseApiController
{
    /// <summary>
    /// Retrieves a list of all technical events and meetups.
    /// </summary>
    /// <remarks>
    /// Returns all scheduled meetups including title, date, venue, city, track tags, host details, and attendee lists.
    /// Supports client-side filtering by technical track category or status.
    /// </remarks>
    /// <param name="pageNumber">Optional 1-based page index for pagination.</param>
    /// <param name="pageSize">Optional count of items to retrieve per page.</param>
    /// <param name="category">Optional category to filter activities by.</param>
    /// <param name="status">Optional status filter (e.g., 'all' or 'hosting').</param>
    /// <param name="date">Optional specific date to filter scheduled activities by.</param>
    /// <param name="ct">Cancellation token for aborting the asynchronous query.</param>
    /// <returns>A standardized response containing the collection of activity records.</returns>
    /// <response code="200">Returns the full collection of technical events.</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetActivities(
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] DateTimeOffset? date,
        CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityListQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            Category = category,
            Status = status,
            Date = date
        }, ct));
    }

    /// <summary>
    /// Retrieves the detailed view of a single technical meetup by its unique identifier or URL slug.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) or SEO slug of the activity.</param>
    /// <param name="ct">Cancellation token for aborting the asynchronous query.</param>
    /// <returns>The complete activity record including attendees and venue coordinates.</returns>
    /// <response code="200">The activity was found and returned successfully.</response>
    /// <response code="404">No activity was found matching the provided identifier.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityDetailsQuery { ID = id }, ct));
    }

    /// <summary>
    /// Publishes a new developer event or tech meetup.
    /// </summary>
    /// <remarks>
    /// Requires an authenticated user with a valid JWT Bearer token.
    /// Validates business invariants via FluentValidation before persisting to PostgreSQL.
    /// </remarks>
    /// <param name="command">The event details payload including title, category, date, venue, and city.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>The unique identifier (GUID) of the newly published event.</returns>
    /// <response code="200">The event was created successfully and returned its new identifier.</response>
    /// <response code="400">One or more validation rules failed on the submitted payload.</response>
    /// <response code="401">User is unauthenticated or has provided an invalid/expired token.</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> CreateActivity([FromBody] CreateActivityCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    /// <summary>
    /// Updates details of an existing developer event.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the event being updated.</param>
    /// <param name="command">The updated event properties payload.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>A standardized success response upon updating.</returns>
    /// <response code="200">The event was updated successfully.</response>
    /// <response code="400">Validation failure or mismatched identifier.</response>
    /// <response code="401">User is unauthenticated.</response>
    /// <response code="404">The target event was not found.</response>
    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> EditActivity(string id, [FromBody] EditActivityCommand command, CancellationToken ct)
    {
        command.ID = id;
        return NewResult(await mediator.Send(command, ct));
    }

    /// <summary>
    /// Permanently deletes an event record.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the event to delete.</param>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>A standardized success confirmation.</returns>
    /// <response code="200">The event was deleted successfully.</response>
    /// <response code="401">User is unauthenticated.</response>
    /// <response code="404">The event does not exist.</response>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new DeleteActivityCommand { ID = id }, ct));
    }
}
