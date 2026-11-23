using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Commands.Login;

public record LoginCommand : IRequest<Response<UserDto>>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
