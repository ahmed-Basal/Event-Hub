using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.Commands.RevokeToken;

public class RevokeTokenCommand : IRequest<Response<Unit>>
{
    public string? RefreshToken { get; set; }
}
