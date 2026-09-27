using Application.Activities.Commands;
using Application.Activities.DTO;
using Application.Activities.Queries;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Activity>>> GetActivities(CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetActivityList.Query(), ct));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Activity>> GetActivity(string id, CancellationToken ct)
    {
       return HandleResult(await Mediator.Send(new GetActivityDetails.Query { Id = id }, ct));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateActivity(CreateActivityDto activity, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreateActivity.Command { ActivityDto = activity }, ct));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> EditActivity(string id, EditActivityDto activity, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new EditActivity.Command { Id = id, ActivityDto = activity }, ct));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteActivity(string id, CancellationToken ct)
    {
       return HandleResult(await Mediator.Send(new DeleteActivity.Command { Id = id }, ct));
    }
}
