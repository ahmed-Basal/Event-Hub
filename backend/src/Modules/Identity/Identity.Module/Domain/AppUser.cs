using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using DevMeet.Shared.Common;
using DevMeet.Shared.Events;

namespace Identity.Module.Domain;

/// <summary>
/// Rich domain projection of a Keycloak-authenticated user.
/// Authentication, passwords, and OTP/TOTP are owned exclusively by Keycloak;
/// Id matches the Keycloak subject (sub) UUID.
/// </summary>
public sealed class AppUser : IHasDomainEvents
{
    private readonly List<string> _roles = [];
    private readonly List<IDomainEvent> _domainEvents = [];

    private AppUser() { }

    public string Id { get; private set; } = string.Empty;
    public string UserName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? Bio { get; private set; }
    public string? Picture { get; private set; }
    public DateTimeOffset SyncedAtUtc { get; private set; } = DateTimeOffset.UtcNow;

    public IReadOnlyCollection<string> Roles => _roles.AsReadOnly();

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public static AppUser Create(
        string id,
        string userName,
        string email,
        string? displayName = null,
        string? bio = null,
        string? picture = null,
        IEnumerable<string>? roles = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id, nameof(id));
        ArgumentException.ThrowIfNullOrWhiteSpace(userName, nameof(userName));
        ArgumentException.ThrowIfNullOrWhiteSpace(email, nameof(email));

        var user = new AppUser
        {
            Id = id.Trim(),
            UserName = userName.Trim(),
            Email = email.Trim(),
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? userName.Trim() : displayName.Trim(),
            Bio = string.IsNullOrWhiteSpace(bio) ? null : bio.Trim(),
            Picture = string.IsNullOrWhiteSpace(picture) ? null : picture.Trim(),
            SyncedAtUtc = DateTimeOffset.UtcNow
        };

        user.SetRolesInternal(roles ?? [AppRoles.User]);
        return user;
    }

    public void SyncFromKeycloak(string userName, string email, string? displayName, IEnumerable<string>? roles)
    {
        if (!string.IsNullOrWhiteSpace(userName))
            UserName = userName.Trim();

        if (!string.IsNullOrWhiteSpace(email))
            Email = email.Trim();

        if (!string.IsNullOrWhiteSpace(displayName) && string.IsNullOrWhiteSpace(DisplayName))
            DisplayName = displayName.Trim();

        if (roles is not null)
            SetRolesInternal(roles);

        SyncedAtUtc = DateTimeOffset.UtcNow;
    }

    public void UpdateProfile(string displayName, string? bio)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName, nameof(displayName));
        DisplayName = displayName.Trim();
        Bio = string.IsNullOrWhiteSpace(bio) ? null : bio.Trim();
        _domainEvents.Add(new UserProfileUpdatedEvent(Id, DisplayName));
    }

    public void UpdatePicture(string? pictureUrl)
    {
        Picture = string.IsNullOrWhiteSpace(pictureUrl) ? null : pictureUrl.Trim();
        if (!string.IsNullOrWhiteSpace(Picture))
            _domainEvents.Add(new UserMainPhotoChangedEvent(Id, Picture));
    }

    public void SetRoles(IEnumerable<string> roles)
    {
        ArgumentNullException.ThrowIfNull(roles);
        SetRolesInternal(roles);
        _domainEvents.Add(new UserRolesUpdatedEvent(Id, _roles.AsReadOnly()));
    }

    private void SetRolesInternal(IEnumerable<string> roles)
    {
        var validRoles = roles
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Where(r => AppRoles.All.Contains(r, StringComparer.OrdinalIgnoreCase))
            .Select(r => AppRoles.All.First(a => a.Equals(r, StringComparison.OrdinalIgnoreCase)))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (validRoles.Count == 0)
            validRoles.Add(AppRoles.User);

        _roles.Clear();
        _roles.AddRange(validRoles);
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
}
