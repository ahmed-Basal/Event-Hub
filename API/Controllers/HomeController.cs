using Application.Feature.Home.DTO;
using Application.Feature.Home.Queries.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class HomeController(ISender mediator) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult> GetHomePageData(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetHomePageDataQuery(), ct));
    }
}
