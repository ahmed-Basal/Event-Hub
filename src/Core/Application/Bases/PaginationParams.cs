namespace Core.Application.Bases;

/// <summary>
/// Encapsulates pagination request parameters with bounds enforcement.
/// Adheres to Single Responsibility Principle (SRP).
/// </summary>
public record PaginationParams
{
    private const int MaxPageSize = 50;
    private int _pageSize = 6;

    public int PageNumber { get; init; } = 1;

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value > MaxPageSize ? MaxPageSize : Math.Max(1, value);
    }

    public PaginationParams() { }

    public PaginationParams(int? pageNumber, int? pageSize)
    {
        PageNumber = Math.Max(1, pageNumber ?? 1);
        PageSize = pageSize ?? 6;
    }
}
