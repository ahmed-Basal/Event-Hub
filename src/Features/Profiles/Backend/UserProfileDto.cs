namespace Application.Feature.Profiles;

public record PhotoDto
{
    public required string Id { get; init; }
    public required string Url { get; init; }
    public bool IsMain { get; init; }
}

public record UserProfileDto
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string DisplayName { get; init; }
    public string? Bio { get; init; }
    public string? Image { get; init; }
    public bool Following { get; init; }
    public int FollowersCount { get; init; }
    public int FollowingCount { get; init; }
    public List<PhotoDto> Photos { get; init; } = [];
}

public record UserActivityDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Category { get; init; }
    public DateTimeOffset Date { get; init; }
    public string? Image { get; init; }
}
