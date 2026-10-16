using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Home.Queries.GetHomePageData;

public class GetHomePageDataQuery : IRequest<Response<HomePageDto>>
{
}
