using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.EntityFrameworkCore;
using Payments.Contracts;

namespace Activities.Module.Features.Queries;

public sealed class GetAdminDashboardEndpoint(
    ActivitiesDbContext db,
    IPaymentsDirectory payments,
    IIdentityDirectory identity)
    : EndpointWithoutRequest<ApiResponse<object>>
{
    public override void Configure()
    {
        Get("/api/admin/dashboard");
        Roles(AppRoles.Admin);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var rawOrders = await payments.GetAllOrderSummariesAsync(ct);
        var rawActivities = await db.Activities.AsNoTracking()
            .Include(a => a.Attendees)
            .OrderByDescending(a => a.Date)
            .ToListAsync(ct);

        var userIds = rawOrders.Select(o => o.UserId)
            .Concat(rawActivities.SelectMany(a => a.Attendees.Where(att => att.IsHost).Select(att => att.UserId)))
            .Distinct()
            .ToList();

        var users = await identity.GetByIdsAsync(userIds, ct);
        var activityTitles = rawActivities.ToDictionary(a => a.Id, a => a.Title);

        var orders = rawOrders.Select(o =>
        {
            users.TryGetValue(o.UserId, out var u);
            return new
            {
                o.Id,
                o.ActivityId,
                ActivityTitle = activityTitles.GetValueOrDefault(o.ActivityId, "Activity"),
                BuyerDisplayName = u?.DisplayName ?? "User",
                BuyerEmail = u?.Email,
                o.Amount,
                o.Currency,
                o.Status,
                o.CreatedAt,
                o.PaidAt
            };
        }).ToList();

        var activities = rawActivities.Select(a =>
        {
            var hostId = a.Attendees.FirstOrDefault(att => att.IsHost)?.UserId;
            var hostName = hostId is not null && users.TryGetValue(hostId, out var u) ? u.DisplayName : "Organizer";
            return new
            {
                a.Id,
                a.Title,
                a.Category,
                a.City,
                a.Date,
                a.Price,
                a.MaxCapacity,
                a.IsCancelled,
                AttendeesCount = a.Attendees.Count,
                HostDisplayName = hostName
            };
        }).ToList();

        var totalUsers = await identity.CountUsersAsync(ct);
        var paidOrders = orders.Where(o => o.Status == PaymentStatusNames.Paid).ToList();
        var totalRevenue = paidOrders.Sum(o => o.Amount);

        var paidByActivity = paidOrders
            .GroupBy(o => o.ActivityId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount));

        var trackAnalytics = activities
            .GroupBy(a => string.IsNullOrWhiteSpace(a.Category) ? "Other" : a.Category)
            .Select(g => new
            {
                Track = g.Key,
                EventsCount = g.Count(),
                AttendeesCount = g.Sum(x => x.AttendeesCount),
                Revenue = g.Sum(x => paidByActivity.GetValueOrDefault(x.Id, 0m))
            })
            .OrderByDescending(t => t.AttendeesCount)
            .ToList();

        object data = new
        {
            stats = new
            {
                totalUsers,
                totalActivities = activities.Count,
                totalOrders = orders.Count,
                paidOrders = paidOrders.Count,
                totalRevenue
            },
            orders,
            activities,
            trackAnalytics
        };

        await Send.OkAsync(ApiResponse<object>.Ok(data), ct);
    }
}
