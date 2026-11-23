using Application.Feature.Photos.Commands.AddPhoto;
using Application.Feature.Photos.Commands.DeletePhoto;
using Application.Feature.Photos.Commands.SetMainPhoto;
using Application.Feature.Profiles.Commands.EditProfile;
using Application.Feature.Profiles.Queries.GetProfile;
using Application.Feature.Profiles.Queries.GetUserActivities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProfilesController(ISender mediator) : BaseApiController
{
    [HttpGet("{username}")]
    public async Task<ActionResult> GetProfile(string username, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetProfileQuery { Username = username }, ct));
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult> EditProfile([FromBody] EditProfileCommand command, CancellationToken ct)
    {
        return NewResult(await mediator.Send(command, ct));
    }

    [HttpGet("{username}/activities")]
    public async Task<ActionResult> GetUserActivities(
        string username,
        [FromQuery] string predicate = "future",
        CancellationToken ct = default)
    {
        return NewResult(await mediator.Send(
            new GetUserActivitiesQuery { Username = username, Predicate = predicate }, ct));
    }

    [Authorize]
    [HttpPost("add-photo")]
    public async Task<ActionResult> AddPhoto([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest("No file provided.");
        }

        await using var stream = file.OpenReadStream();
        return NewResult(await mediator.Send(
            new AddPhotoCommand { FileStream = stream, FileName = file.FileName }, ct));
    }

    [Authorize]
    [HttpDelete("{photoId}/photos")]
    public async Task<ActionResult> DeletePhoto(string photoId, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new DeletePhotoCommand { PhotoId = photoId }, ct));
    }

    [Authorize]
    [HttpPut("{photoId}/setMain")]
    public async Task<ActionResult> SetMainPhoto(string photoId, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new SetMainPhotoCommand { PhotoId = photoId }, ct));
    }
}
