using Domain;

namespace Application.Feature.Activities.Queries.GetActivityList;

/// <summary>
/// Domain query specifications and filters for Activity entities.
/// </summary>
public static class ActivityQueryExtensions
{
    public static IQueryable<Activity> FilterByCategory(this IQueryable<Activity> query, string? category)
    {
        if (string.IsNullOrWhiteSpace(category) || category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            return query;
        }

        var normalizedCategory = category.ToLower();
        return query.Where(a => a.Category.ToLower() == normalizedCategory);
    }

    public static IQueryable<Activity> FilterByStatus(this IQueryable<Activity> query, string? status)
    {
        if (string.IsNullOrWhiteSpace(status) || status.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            return query;
        }

        if (status.Equals("hosting", StringComparison.OrdinalIgnoreCase))
        {
            return query.Where(a => !a.IsCancelled);
        }

        return query;
    }

    public static IQueryable<Activity> FilterByUserRelation(
        this IQueryable<Activity> query,
        string? filter,
        string? currentUserId)
    {
        if (string.IsNullOrWhiteSpace(filter) ||
            filter.Equals("all", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(currentUserId))
        {
            return query;
        }

        return filter.ToLowerInvariant() switch
        {
            "isgoing" => query.Where(a => a.Attendees.Any(x => x.UserId == currentUserId)),
            "ishost" => query.Where(a => a.Attendees.Any(x => x.UserId == currentUserId && x.IsHost)),
            "isfollowing" => query.Where(a => a.Attendees.Any(x =>
                x.User.Followers.Any(f => f.ObserverId == currentUserId))),
            _ => query
        };
    }

    public static IQueryable<Activity> FilterByDate(this IQueryable<Activity> query, DateTimeOffset? date)
    {
        if (!date.HasValue)
        {
            return query;
        }

        var startOfDay = new DateTimeOffset(date.Value.UtcDateTime.Date, TimeSpan.Zero);
        var endOfDay = startOfDay.AddDays(1);

        return query.Where(a => a.Date >= startOfDay && a.Date < endOfDay);
    }

    public static IQueryable<Activity> FilterByStartDate(this IQueryable<Activity> query, DateTimeOffset? startDate)
    {
        if (!startDate.HasValue)
        {
            return query;
        }

        return query.Where(a => a.Date >= startDate.Value);
    }

    public static IQueryable<Activity> FilterBySearch(this IQueryable<Activity> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var term = search.Trim().ToLower();
        return query.Where(a =>
            a.Title.ToLower().Contains(term) ||
            a.Description.ToLower().Contains(term) ||
            a.City.ToLower().Contains(term) ||
            a.Venue.ToLower().Contains(term) ||
            a.Category.ToLower().Contains(term));
    }

    public static IQueryable<Activity> FilterByCity(this IQueryable<Activity> query, string? city)
    {
        if (string.IsNullOrWhiteSpace(city) || city.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            return query;
        }

        var normalized = city.Trim().ToLower();
        return query.Where(a => a.City.ToLower() == normalized);
    }

    public static IQueryable<Activity> FilterByPricing(this IQueryable<Activity> query, string? pricing)
    {
        if (string.IsNullOrWhiteSpace(pricing) || pricing.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            return query;
        }

        return pricing.ToLowerInvariant() switch
        {
            "free" => query.Where(a => a.Price <= 0),
            "paid" => query.Where(a => a.Price > 0),
            _ => query
        };
    }

    public static IQueryable<Activity> OrderByOption(this IQueryable<Activity> query, string? sortBy)
    {
        var now = DateTimeOffset.UtcNow;
        return (sortBy ?? "date").ToLowerInvariant() switch
        {
            "hot" => query
                .OrderByDescending(a => !a.IsCancelled && a.Date >= now)
                .ThenByDescending(a => (a.Attendees.Count * 4) + (a.Comments.Count * 2) + (a.Price > 0 ? 6 : 1))
                .ThenBy(a => a.Date),
            "popular" => query.OrderByDescending(a => a.Attendees.Count).ThenBy(a => a.Date),
            "priceasc" => query.OrderBy(a => a.Price).ThenBy(a => a.Date),
            "pricedesc" => query.OrderByDescending(a => a.Price).ThenBy(a => a.Date),
            _ => query.OrderBy(a => a.Date)
        };
    }

    public static IQueryable<Activity> OrderByUpcoming(this IQueryable<Activity> query)
    {
        return query.OrderBy(a => a.Date);
    }
}
