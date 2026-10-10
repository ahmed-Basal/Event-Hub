namespace Core.Domain;

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public User? User { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresUtc;
    public bool IsRevoked => RevokedAtUtc != null;
    public bool IsActive => !IsRevoked && !IsExpired;
}
