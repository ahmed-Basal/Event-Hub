namespace Application.Feature.Comments;

public record CommentDto
{
    public required string Id { get; init; }
    public required string Body { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public required string UserId { get; init; }
    public required string Username { get; init; }
    public required string DisplayName { get; init; }
    public string? Image { get; init; }
}
