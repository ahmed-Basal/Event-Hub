using Microsoft.AspNetCore.Identity;

namespace Core.Domain;

public class User : IdentityUser
{

    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? Picture { get; set; }


    public ICollection<ActivityAttendee> Activities { get; set; } = new HashSet<ActivityAttendee>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
