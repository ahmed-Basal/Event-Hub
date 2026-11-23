using Application.Bases;
using Domain;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Feature.Admin.Commands.UpdateUserRoles;

public class UpdateUserRolesCommand : IRequest<Response<List<string>>>
{
    public required string Username { get; set; }
    public required List<string> Roles { get; set; }
}

public class UpdateUserRolesCommandHandler(UserManager<User> userManager)
    : ResponseHandler, IRequestHandler<UpdateUserRolesCommand, Response<List<string>>>
{
    public async Task<Response<List<string>>> Handle(
        UpdateUserRolesCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(request.Username)
            ?? await userManager.FindByEmailAsync(request.Username);

        if (user is null)
        {
            return NotFound<List<string>>("User not found.");
        }

        var validRoles = request.Roles
            .Where(r => AppRoles.All.Contains(r, StringComparer.OrdinalIgnoreCase))
            .Select(r => AppRoles.All.First(a => a.Equals(r, StringComparison.OrdinalIgnoreCase)))
            .Distinct()
            .ToList();

        if (validRoles.Count == 0)
        {
            validRoles.Add(AppRoles.Member);
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        var toAdd = validRoles.Except(currentRoles).ToList();
        var toRemove = currentRoles.Except(validRoles).ToList();

        if (toAdd.Count > 0) await userManager.AddToRolesAsync(user, toAdd);
        if (toRemove.Count > 0) await userManager.RemoveFromRolesAsync(user, toRemove);

        var updated = (await userManager.GetRolesAsync(user)).ToList();
        return Success(updated);
    }
}
