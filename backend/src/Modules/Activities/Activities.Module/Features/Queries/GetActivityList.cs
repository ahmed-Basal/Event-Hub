using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Profiles.Contracts;

namespace Activities.Module.Features.Queries;

public sealed class GetActivityListRequest
{
    [QueryParam] public int? PageNumber { get; init; }
    [QueryParam] public int? PageSize { get; init; }
    [QueryParam] public string? Category { get; init; }
    [QueryParam] public string? Status { get; init; }
    [QueryParam] public DateTimeOffset? Date { get; init; }
    [QueryParam] public DateTimeOffset? StartDate { get; init; }
    [QueryParam] public string? Filter { get; init; }
    [QueryParam] public string? Search { get; init; }
    [QueryParam] public string? City { get; init; }
    [QueryParam] public string? Pricing { get; init; }
    [QueryParam] public string? SortBy { get; init; }
}

public sealed record PaginationMeta(int CurrentPage, int PageSize, int TotalCount, int TotalPages);

public sealed class GetActivityListEndpoint(
    ActivitiesDbContext db,
    IIdentityDirectory identity,
    IProfilesDirectory profiles,
    ICurrentUser currentUser)
    : Endpoint<GetActivityListRequest, ApiResponse<List<ActivityDto>>>
{
    public override void Configure()
    {
        Get("/api/activities");
        AllowAnonymous();
        Options(x => x.CacheOutput("PublicEvents"));
    }

    public override async Task HandleAsync(GetActivityListRequest req, CancellationToken ct)
    {
        var userId = currentUser.UserIdOrNull;
        var query = db.Activities.AsNoTracking()
            .Include(a => a.Attendees)
            .Include(a => a.Waitlist)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(req.Category) && !req.Category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var cat = req.Category.ToLower();
            query = query.Where(a => a.Category.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(req.Status) && req.Status.Equals("hosting", StringComparison.OrdinalIgnoreCase))
            query = query.Where(a => !a.IsCancelled);

        if (!string.IsNullOrWhiteSpace(req.Filter) && !string.IsNullOrWhiteSpace(userId))
        {
            switch (req.Filter.ToLowerInvariant())
            {
                case "isgoing":
                    query = query.Where(a => a.Attendees.Any(x => x.UserId == userId));
                    break;
                case "ishost":
                    query = query.Where(a => a.Attendees.Any(x => x.UserId == userId && x.IsHost));
                    break;
                case "isfollowing":
                    var followingIds = await profiles.GetFollowingUserIdsAsync(userId, ct);
                    query = query.Where(a => a.Attendees.Any(x => followingIds.Contains(x.UserId)));
                    break;
            }
        }

        if (req.Date.HasValue)
        {
            var startOfDay = new DateTimeOffset(req.Date.Value.UtcDateTime.Date, TimeSpan.Zero);
            var endOfDay = startOfDay.AddDays(1);
            query = query.Where(a => a.Date >= startOfDay && a.Date < endOfDay);
        }

        if (req.StartDate.HasValue)
            query = query.Where(a => a.Date >= req.StartDate.Value);

        if (!string.IsNullOrWhiteSpace(req.Search))
        {
            var term = req.Search.Trim().ToLower();
            query = query.Where(a =>
                a.Title.ToLower().Contains(term) ||
                a.Description.ToLower().Contains(term) ||
                a.City.ToLower().Contains(term) ||
                a.Venue.ToLower().Contains(term) ||
                a.Category.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(req.City) && !req.City.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            var city = req.City.Trim().ToLower();
            query = query.Where(a => a.City.ToLower() == city);
        }

        if (!string.IsNullOrWhiteSpace(req.Pricing) && !req.Pricing.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            query = req.Pricing.ToLowerInvariant() switch
            {
                "free" => query.Where(a => a.Price <= 0),
                "paid" => query.Where(a => a.Price > 0),
                _ => query
            };
        }

        var nowUtc = DateTimeOffset.UtcNow;
        query = (req.SortBy?.ToLowerInvariant()) switch
        {
            "hot" => query
                .OrderByDescending(a => !a.IsCancelled && a.Date >= nowUtc)
                .ThenBy(a => a.Date),
            "popular" => query.OrderByDescending(a => a.Attendees.Count).ThenBy(a => a.Date),
            "price_asc" => query.OrderBy(a => a.Price).ThenBy(a => a.Date),
            "price_desc" => query.OrderByDescending(a => a.Price).ThenBy(a => a.Date),
            _ => query.OrderBy(a => a.Date)
        };

        if (req.PageNumber.HasValue || req.PageSize.HasValue)
        {
            var page = Math.Max(1, req.PageNumber ?? 1);
            var size = Math.Clamp(req.PageSize ?? 10, 1, 50);
            var totalCount = await query.CountAsync(ct);
            var entities = await query.Skip((page - 1) * size).Take(size).ToListAsync(ct);
            var dtos = await ActivityMapper.MapToDtosAsync(entities, identity, profiles, userId, ct);
            var meta = new PaginationMeta(page, size, totalCount, (int)Math.Ceiling(totalCount / (double)size));
            await Send.OkAsync(ApiResponse<List<ActivityDto>>.Ok(dtos, meta: meta), ct);
            return;
        }

        var allEntities = await query.ToListAsync(ct);
        var allDtos = await ActivityMapper.MapToDtosAsync(allEntities, identity, profiles, userId, ct);
        await Send.OkAsync(ApiResponse<List<ActivityDto>>.Ok(allDtos), ct);
    }
}
