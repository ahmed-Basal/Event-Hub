using Core.Application.Feature.Account.Queries.GetCurrentUser;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Commands.Login;

public record LoginCommand : IRequest<Response<UserDto>>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
