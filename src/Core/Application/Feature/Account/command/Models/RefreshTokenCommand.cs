using Core.Application.Feature.Account.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.command.Models;

public class RefreshTokenCommand : IRequest<Response<UserDto>>
{
    public string? RefreshToken { get; set; }
}
