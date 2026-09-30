using Application.Home.DTO;
using Application.Home.Queries;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class HomeController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<HomePageDto>> GetHomePageData(CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new GetHomePageData.Query(), ct));
    }
}
