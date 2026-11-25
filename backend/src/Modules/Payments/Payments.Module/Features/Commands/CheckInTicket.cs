using System.Net;
using Activities.Contracts;
using DevMeet.Shared.Common;
using FastEndpoints;
using FluentValidation;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Payments.Module.Infrastructure;

namespace Payments.Module.Features.Commands;

public sealed class CheckInTicketRequest
{
    public string CheckInCode { get; init; } = string.Empty;
}

public sealed class CheckInTicketValidator : Validator<CheckInTicketRequest>
{
    public CheckInTicketValidator()
    {
        RuleFor(x => x.CheckInCode).NotEmpty();
    }
}

public sealed record CheckInTicketResult(
    string OrderId,
    string ActivityId,
    string AttendeeUserId,
    string AttendeeDisplayName,
    string CheckInCode,
    DateTimeOffset CheckedInAtUtc);

public sealed class CheckInTicketEndpoint(
    PaymentsDbContext db,
    IActivitiesDirectory activities,
    IIdentityDirectory identity,
    ICurrentUser currentUser)
    : Endpoint<CheckInTicketRequest, ApiResponse<CheckInTicketResult>>
{
    public override void Configure()
    {
        Post("/api/payments/check-in");
        Roles(AppRoles.Admin, AppRoles.Organizer);
    }

    public override async Task HandleAsync(CheckInTicketRequest req, CancellationToken ct)
    {
        var code = req.CheckInCode.Trim();
        var order = await db.TicketOrders.FirstOrDefaultAsync(o => o.CheckInCode == code, ct);
        if (order is null)
        {
            await Send.ResponseAsync(ApiResponse<CheckInTicketResult>.Fail(HttpStatusCode.NotFound, "Ticket code not found."), 404, ct);
            return;
        }

        var isAdmin = HttpContext.User.IsInRole(AppRoles.Admin);
        var isHost = await activities.IsHostAsync(order.ActivityId, currentUser.UserId, ct);
        if (!isAdmin && !isHost)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        try
        {
            order.CheckIn(currentUser.UserId);
            await db.SaveChangesAsync(ct);
        }
        catch (InvalidOperationException ex)
        {
            await Send.ResponseAsync(ApiResponse<CheckInTicketResult>.Fail(HttpStatusCode.BadRequest, ex.Message), 400, ct);
            return;
        }

        var attendee = await identity.GetByIdAsync(order.UserId, ct);
        var result = new CheckInTicketResult(
            order.Id,
            order.ActivityId,
            order.UserId,
            attendee?.DisplayName ?? attendee?.UserName ?? "Attendee",
            order.CheckInCode!,
            order.CheckedInAtUtc!.Value);

        await Send.OkAsync(ApiResponse<CheckInTicketResult>.Ok(result, "Ticket checked in successfully."), ct);
    }
}
