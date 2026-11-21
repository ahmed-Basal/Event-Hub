using Core.Domain.Common;

namespace Core.Domain;

/// <summary>
/// Refresh token entity tracking authentication sessions.
/// Inherits from AuditEntity and is sealed.
/// </summary>
public sealed class RefreshToken : AuditEntity<Guid>
{
    public RefreshToken()
    {
        Id = Guid.NewGuid();
    }

    public required string UserId { get; set; }
    public User? User { get; set; }
    public required string Token { get; set; }
    public DateTimeOffset ExpiresUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }

    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresUtc;
    public bool IsRevoked => RevokedAtUtc != null;
    public bool IsActive => !IsRevoked && !IsExpired;
}
