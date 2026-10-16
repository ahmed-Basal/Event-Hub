using Core.Application.Feature.Account.Queries.GetCurrentUser;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Commands.Register;

public record RegisterCommand : IRequest<Response<UserDto>>
{
    public required string DisplayName { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
}
