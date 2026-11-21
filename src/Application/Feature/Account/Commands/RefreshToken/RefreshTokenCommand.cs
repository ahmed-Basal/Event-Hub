using Core.Application.Feature.Account.Queries.GetCurrentUser;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<Response<UserDto>>
{
    public string? RefreshToken { get; set; }
}
