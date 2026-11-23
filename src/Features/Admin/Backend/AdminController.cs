using Application.Feature.Admin.Commands.DeleteActivityAsAdmin;
using Application.Feature.Admin.Commands.ToggleCancelActivity;
using Application.Feature.Admin.Commands.UpdateUserRoles;
using Application.Feature.Admin.Queries.GetAdminDashboard;
using Application.Feature.Admin.Queries.GetUsersWithRoles;
using Application.Feature.Payments.Commands.RefundOrder;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = AppRoles.Admin)]
public class AdminController(ISender mediator) : BaseApiController
{
    public record UpdateRolesRequest(List<string> Roles);

    [HttpGet("users")]
    public async Task<ActionResult> GetUsersWithRoles(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetUsersWithRolesQuery(), ct));
    }

    [HttpPost("users/{username}/roles")]
    public async Task<ActionResult> UpdateUserRoles(string username, [FromBody] UpdateRolesRequest request, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new UpdateUserRolesCommand
        {
            Username = username,
            Roles = request.Roles
        }, ct));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard(CancellationToken ct)
    {
        return NewResult(await mediator.Send(new GetAdminDashboardQuery(), ct));
    }

    [HttpPost("orders/{orderId}/refund")]
    public async Task<ActionResult> RefundOrder(string orderId, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new RefundOrderCommand { OrderId = orderId }, ct));
    }

    [HttpPost("activities/{id}/toggle-cancel")]
    public async Task<ActionResult> ToggleCancelActivity(string id, CancellationToken ct)
    {
        var result = await mediator.Send(new ToggleCancelActivityCommand { ActivityId = id }, ct);
        if (!result.Succeeded) return NewResult(result);
        return Ok(new { succeeded = true, isCancelled = result.Data });
    }

    [HttpDelete("activities/{id}")]
    public async Task<ActionResult> DeleteActivityAsAdmin(string id, CancellationToken ct)
    {
        return NewResult(await mediator.Send(new DeleteActivityAsAdminCommand { ActivityId = id }, ct));
    }
}
