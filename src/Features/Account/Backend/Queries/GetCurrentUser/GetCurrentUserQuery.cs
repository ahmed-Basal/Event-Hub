using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Queries.GetCurrentUser;

public class GetCurrentUserQuery : IRequest<Response<UserDto>>
{
}
