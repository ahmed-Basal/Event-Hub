using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.command.Models;

public class RevokeTokenCommand : IRequest<Response<string>>
{
    public string? RefreshToken { get; set; }
}
