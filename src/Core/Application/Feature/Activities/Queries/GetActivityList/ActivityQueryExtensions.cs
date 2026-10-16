using Core.Domain;

namespace Core.Application.Feature.Activities.Queries.GetActivityList;

/// <summary>
/// Domain query specifications and filters for Activity entities.
/// Adheres to Open/Closed Principle (OCP) and Single Responsibility Principle (SRP).
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

    public static IQueryable<Activity> FilterByDate(this IQueryable<Activity> query, DateTime? date)
    {
        if (!date.HasValue)
        {
            return query;
        }

        var startOfDay = DateTime.SpecifyKind(date.Value.Date, DateTimeKind.Utc);
        var endOfDay = startOfDay.AddDays(1);

        return query.Where(a => a.Date >= startOfDay && a.Date < endOfDay);
    }

    public static IQueryable<Activity> OrderByUpcoming(this IQueryable<Activity> query)
    {
        return query.OrderBy(a => a.Date);
    }
}
