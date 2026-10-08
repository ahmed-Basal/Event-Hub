using Application.Feature.Activities.command.Models;
using Application.Feature.Activities.DTO;
using Application.Feature.Activities.Queries.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController(ISender mediator) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult> GetActivities(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityListQuery(), ct));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetActivityDetailsQuery { ID = id }, ct));
    }

    [HttpPost]
    public async Task<ActionResult> CreateActivity([FromBody] CreateActivityDto activity, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new CreateActivityCommand { ActivityDto = activity }, ct));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> EditActivity(string id, [FromBody] EditActivityDto dto, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new EditActivityCommand { ID = id, ActivityDto = dto }, ct));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteActivity(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new DeleteActivityCommand { ID = id }, ct));
    }
}
