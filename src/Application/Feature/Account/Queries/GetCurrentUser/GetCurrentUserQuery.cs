using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Queries.GetCurrentUser;

public class GetCurrentUserQuery : IRequest<Response<UserDto>>
{
}
