using Application.Bases;
using MediatR;

namespace Application.Feature.Home.Queries.GetHomePageData;

public class GetHomePageDataQuery : IRequest<Response<HomePageDto>>
{
}
