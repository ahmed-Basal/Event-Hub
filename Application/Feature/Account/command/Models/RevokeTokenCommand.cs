using Application.Bases;
using MediatR;

namespace Application.Feature.Account.command.Models;

public class RevokeTokenCommand : IRequest<Response<string>>
{
    public string? RefreshToken { get; set; }
}
