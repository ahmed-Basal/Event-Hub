using Application.Feature.Account.Queries.GetCurrentUser;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<Response<UserDto>>
{
    public string? RefreshToken { get; set; }
}
