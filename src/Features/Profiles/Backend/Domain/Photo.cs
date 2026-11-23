using Domain.Common;

namespace Domain;

public sealed class Photo : BaseEntity<string>
{
    private Photo() { }

    public string Url { get; private set; } = string.Empty;
    public bool IsMain { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public User User { get; private set; } = null!;

    public static Photo Create(string id, string url, string userId, bool isMain = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id, nameof(id));
        ArgumentException.ThrowIfNullOrWhiteSpace(url, nameof(url));
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));

        return new Photo
        {
            Id = id.Trim(),
            Url = url.Trim(),
            UserId = userId.Trim(),
            IsMain = isMain
        };
    }

    public void MarkAsMain() => IsMain = true;

    public void UnmarkAsMain() => IsMain = false;
}
