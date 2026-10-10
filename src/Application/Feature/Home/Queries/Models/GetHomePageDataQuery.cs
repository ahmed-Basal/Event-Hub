using Application.Bases;
using Application.Feature.Home.DTO;
using MediatR;

namespace Application.Feature.Home.Queries.Models;

public class GetHomePageDataQuery : IRequest<Response<HomePageDto>>
{
}
