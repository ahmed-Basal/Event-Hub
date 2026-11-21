using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Bases;

/// <summary>
/// Provides reusable LINQ queryable extensions for pagination and projection.
/// Adheres to Single Responsibility (SRP) and Open/Closed Principle (OCP).
/// </summary>
public static class PagedQueryableExtensions
{
    public static async Task<(List<TDestination> Items, PaginationMeta Meta)> ToPagedResultAsync<TSource, TDestination>(
        this IQueryable<TSource> query,
        PaginationParams pagination,
        IConfigurationProvider mapperConfig,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectTo<TDestination>(mapperConfig)
            .ToListAsync(cancellationToken);

        var meta = new PaginationMeta(pagination.PageNumber, pagination.PageSize, totalCount);

        return (items, meta);
    }
}
