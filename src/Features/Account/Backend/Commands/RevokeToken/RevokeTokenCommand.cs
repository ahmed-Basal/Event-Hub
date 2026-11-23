using Application.Bases;
using MediatR;

namespace Application.Feature.Account.Commands.RevokeToken;

public class RevokeTokenCommand : IRequest<Response<Unit>>
{
    public string? RefreshToken { get; set; }
}
