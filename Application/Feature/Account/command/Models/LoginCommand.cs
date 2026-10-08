using Application.Feature.Account.DTO;
using Application.Bases;
using MediatR;

namespace Application.Feature.Account.command.Models;

public class LoginCommand : IRequest<Response<UserDto>>
{
    public required LoginDto LoginDto { get; set; }
}
