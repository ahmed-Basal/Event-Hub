using Core.Application.Bases;
using Core.Application.Feature.Home.DTO;
using MediatR;

namespace Core.Application.Feature.Home.Queries.Models;

public class GetHomePageDataQuery : IRequest<Response<HomePageDto>>
{
}
