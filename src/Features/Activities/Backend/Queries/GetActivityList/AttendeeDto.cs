namespace Application.Feature.Activities.Queries.GetActivityList;

public record AttendeeDto
{
    public required string Username { get; init; }
    public required string DisplayName { get; init; }
    public string? Bio { get; init; }
    public string? Image { get; init; }
    public bool IsHost { get; init; }
    public bool Following { get; init; }
    public int FollowersCount { get; init; }
    public int FollowingCount { get; init; }
}
