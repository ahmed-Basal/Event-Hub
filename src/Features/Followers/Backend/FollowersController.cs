using Application.Feature.Followers.Commands.FollowToggle;
using Application.Feature.Followers.Queries.GetFollowings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/profiles")]
public class FollowersController(ISender mediator) : BaseApiController
{
    [Authorize]
    [HttpPost("{username}/follow")]
    public async Task<ActionResult> FollowToggle(string username, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new FollowToggleCommand { TargetUsername = username }, ct));
    }

    [HttpGet("{username}/follow-list")]
    public async Task<ActionResult> GetFollowings(
        string username,
        [FromQuery] string predicate = "followers",
        CancellationToken ct = default)
    {
        return NewResult(await mediator.Send(
            new GetFollowingsQuery { Username = username, Predicate = predicate }, ct));
    }
}
