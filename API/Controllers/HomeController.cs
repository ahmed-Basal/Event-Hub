using Application.Feature.Home.DTO;
using Application.Feature.Home.Queries.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Exposes aggregated platform metrics, upcoming conference previews, and flagship featured meetups.
/// </summary>
public class HomeController(ISender mediator) : BaseApiController
{
    /// <summary>
    /// Retrieves home landing page data including featured meetup, upcoming events strip, and community metrics.
    /// </summary>
    /// <param name="ct">Cancellation token for aborting the operation.</param>
    /// <returns>Aggregated landing page dataset for the frontend hero view.</returns>
    /// <response code="200">Landing page dataset successfully fetched.</response>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> GetHomePageData(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetHomePageDataQuery(), ct));
    }
}
