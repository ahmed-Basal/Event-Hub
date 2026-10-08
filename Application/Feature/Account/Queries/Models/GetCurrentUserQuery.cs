using Application.Feature.Account.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Queries.Models;

public class GetCurrentUserQuery : IRequest<Response<UserDto>>
{
}
