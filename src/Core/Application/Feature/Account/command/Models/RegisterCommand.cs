using Core.Application.Feature.Account.DTO;
using Core.Application.Bases;
using MediatR;

namespace Core.Application.Feature.Account.command.Models;

public class RegisterCommand : IRequest<Response<UserDto>>
{
    public required RegisterDto RegisterDto { get; set; }
}
