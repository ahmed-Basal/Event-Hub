using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required(ErrorMessage = "TokenKey is required for JWT configuration.")]
    [MinLength(64, ErrorMessage = "TokenKey must be at least 64 characters long.")]
    public string TokenKey { get; set; } = string.Empty;

    public int ExpirationInDays { get; set; } = 7;
    public int ExpirationInMinutes { get; set; } = 15;
    public int RefreshTokenExpirationInDays { get; set; } = 7;
}
