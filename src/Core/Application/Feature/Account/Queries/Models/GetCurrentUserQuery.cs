using Core.Application.Feature.Account.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Queries.Models;

public class GetCurrentUserQuery : IRequest<Response<UserDto>>
{
}
