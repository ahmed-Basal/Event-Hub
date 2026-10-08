using Application.Feature.Account.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.command.Models;

public class RefreshTokenCommand : IRequest<Response<UserDto>>
{
    public string? RefreshToken { get; set; }
}
