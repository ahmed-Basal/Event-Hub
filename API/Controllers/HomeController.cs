using Application.Home.DTO;
using Application.Home.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class HomeController(ISender mediator) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<HomePageDto>> GetHomePageData(CancellationToken ct)
    {
        return HandleResult(await mediator.Send(new GetHomePageData.Query(), ct));
    }
}
