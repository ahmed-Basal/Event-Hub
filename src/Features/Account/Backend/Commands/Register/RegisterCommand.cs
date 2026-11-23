using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Commands.Register;

public record RegisterCommand : IRequest<Response<UserDto>>
{
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}
