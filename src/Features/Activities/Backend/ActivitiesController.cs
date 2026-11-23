using Application.Feature.Activities.Commands.CreateActivity;
using Application.Feature.Activities.Commands.DeleteActivity;
using Application.Feature.Activities.Commands.EditActivity;
using Application.Feature.Activities.Commands.UpdateAttendance;
using Application.Feature.Activities.Queries.GetActivityDetails;
using Application.Feature.Activities.Queries.GetActivityList;
using Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Manages tech meetup events, workshops, conferences, and attendee RSVPs.
/// </summary>
public class ActivitiesController(ISender mediator) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetActivities(
        [FromQuery] int? pageNumber,
        [FromQuery] int? pageSize,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] DateTimeOffset? date,
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] string? filter,
        [FromQuery] string? search,
        [FromQuery] string? city,
        [FromQuery] string? pricing,
        [FromQuery] string? sortBy,
        CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityListQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            Category = category,
            Status = status,
            Date = date,
            StartDate = startDate,
            Filter = filter,
            Search = search,
            City = city,
            Pricing = pricing,
            SortBy = sortBy
        }, ct));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityDetailsQuery { ID = id }, ct));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Organizer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> CreateActivity([FromBody] CreateActivityCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = IsHostRequirement.PolicyName)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> EditActivity(string id, [FromBody] EditActivityCommand command, CancellationToken ct)
    {
        command.ID = id;
        return NewResult(await mediator.Send(command, ct));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = IsHostRequirement.PolicyName)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new DeleteActivityCommand { ID = id }, ct));
    }

    [HttpPost("{id}/attend")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Attend(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new UpdateAttendanceCommand { ActivityId = id }, ct));
    }
}
