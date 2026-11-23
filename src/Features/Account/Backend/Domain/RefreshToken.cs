using Domain.Common;
using Domain.Events;

namespace Domain;

/// <summary>
/// Refresh token entity tracking authentication sessions.
/// Inherits from AuditEntity and is sealed.
/// </summary>
public sealed class RefreshToken : AuditEntity<Guid>
{
    private RefreshToken() { }

    public string UserId { get; private set; } = string.Empty;
    public User? User { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresUtc { get; private set; }
    public DateTimeOffset? RevokedAtUtc { get; private set; }
    public string? ReplacedByToken { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? RevokedByIp { get; private set; }

    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresUtc;
    public bool IsRevoked => RevokedAtUtc != null;
    public bool IsActive => !IsRevoked && !IsExpired;

    public static RefreshToken Create(
        string userId,
        string token,
        DateTimeOffset expiresUtc,
        string? createdByIp = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId, nameof(userId));
        ArgumentException.ThrowIfNullOrWhiteSpace(token, nameof(token));

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId.Trim(),
            Token = token,
            ExpiresUtc = expiresUtc.ToUniversalTime(),
            CreatedAtUtc = DateTimeOffset.UtcNow,
            CreatedByIp = string.IsNullOrWhiteSpace(createdByIp) ? null : createdByIp.Trim()
        };
    }

    public void Revoke(string? revokedByIp = null, string? replacedByToken = null)
    {
        if (IsRevoked) return;

        RevokedAtUtc = DateTimeOffset.UtcNow;
        RevokedByIp = string.IsNullOrWhiteSpace(revokedByIp) ? null : revokedByIp.Trim();
        ReplacedByToken = string.IsNullOrWhiteSpace(replacedByToken) ? null : replacedByToken;

        AddDomainEvent(new RefreshTokenRevokedEvent(Id, UserId, RevokedByIp));
    }
}
