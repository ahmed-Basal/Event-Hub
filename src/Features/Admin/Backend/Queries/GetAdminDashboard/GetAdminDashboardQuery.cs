using Application.Bases;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Feature.Admin.Queries.GetAdminDashboard;

public class GetAdminDashboardQuery : IRequest<Response<object>>;

public class GetAdminDashboardQueryHandler(IAppDbContext dbContext)
    : ResponseHandler, IRequestHandler<GetAdminDashboardQuery, Response<object>>
{
    public async Task<Response<object>> Handle(
        GetAdminDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var orders = await dbContext.TicketOrders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.ActivityId,
                ActivityTitle = o.Activity.Title,
                BuyerDisplayName = o.User.DisplayName ?? o.User.UserName ?? "User",
                BuyerEmail = o.User.Email,
                o.Amount,
                o.Currency,
                Status = o.Status.ToString(),
                o.CreatedAt,
                o.PaidAt
            })
            .ToListAsync(cancellationToken);

        var activities = await dbContext.Activities
            .AsNoTracking()
            .OrderByDescending(a => a.Date)
            .Select(a => new
            {
                Id = a.Id,
                a.Title,
                a.Category,
                a.City,
                a.Date,
                a.Price,
                a.IsCancelled,
                AttendeesCount = a.Attendees.Count,
                HostDisplayName = a.Attendees
                    .Where(att => att.IsHost)
                    .Select(att => att.User.DisplayName ?? att.User.UserName)
                    .FirstOrDefault() ?? "Organizer"
            })
            .ToListAsync(cancellationToken);

        var totalUsers = await dbContext.Users.AsNoTracking().CountAsync(cancellationToken);
        var paidOrders = orders.Where(o => o.Status == nameof(PaymentStatus.Paid)).ToList();
        var totalRevenue = paidOrders.Sum(o => o.Amount);

        var paidByActivity = await dbContext.TicketOrders
            .AsNoTracking()
            .Where(o => o.Status == PaymentStatus.Paid)
            .GroupBy(o => o.ActivityId)
            .Select(g => new { ActivityId = g.Key, Revenue = g.Sum(x => x.Amount) })
            .ToDictionaryAsync(x => x.ActivityId, x => x.Revenue, cancellationToken);

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
            kpis = new
            {
                totalRevenue,
                paidOrdersCount = paidOrders.Count,
                totalUsers,
                activeEventsCount = activities.Count(a => !a.IsCancelled),
                cancelledEventsCount = activities.Count(a => a.IsCancelled)
            },
            orders,
            activities,
            trackAnalytics
        };

        return Success(data);
    }
}
