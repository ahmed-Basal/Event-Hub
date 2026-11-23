using Application.Bases;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Admin.Queries.GetUsersWithRoles;

public record AdminUserRoleDto(
    string Id,
    string Username,
    string DisplayName,
    string? Email,
    List<string> Roles);

public class GetUsersWithRolesQuery : IRequest<Response<List<AdminUserRoleDto>>>;

public class GetUsersWithRolesQueryHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<GetUsersWithRolesQuery, Response<List<AdminUserRoleDto>>>
{
    public async Task<Response<List<AdminUserRoleDto>>> Handle(
        GetUsersWithRolesQuery request,
        CancellationToken cancellationToken)
    {
        // Single-query projection + role lookup (eliminates N+1 GetRolesAsync loop)
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(u => u.Email)
            .Select(u => new
            {
                u.Id,
                Username = u.UserName ?? u.Id,
                DisplayName = u.DisplayName ?? u.UserName ?? "User",
                u.Email
            })
            .ToListAsync(cancellationToken);

        var userRolePairs = await (
            from ur in dbContext.UserRoles.AsNoTracking()
            join r in dbContext.Roles.AsNoTracking() on ur.RoleId equals r.Id
            where r.Name != null
            select new { ur.UserId, RoleName = r.Name! }
        ).ToListAsync(cancellationToken);

        var rolesByUser = userRolePairs
            .GroupBy(x => x.UserId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.RoleName).ToList());

        var result = users
            .Select(u => new AdminUserRoleDto(
                u.Id,
                u.Username,
                u.DisplayName,
                u.Email,
                rolesByUser.GetValueOrDefault(u.Id, [])))
            .ToList();

        return Success(result);
    }
}
