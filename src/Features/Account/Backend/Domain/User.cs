using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Domain.Common;
using Domain.Events;
using Microsoft.AspNetCore.Identity;

namespace Domain;

public sealed class User : IdentityUser, IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private User() { }

    public string? DisplayName { get; private set; }
    public string? Bio { get; private set; }
    public string? Picture { get; private set; }

    public ICollection<ActivityAttendee> Activities { get; set; } = new HashSet<ActivityAttendee>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<UserFollowing> Followings { get; set; } = new List<UserFollowing>();
    public ICollection<UserFollowing> Followers { get; set; } = new List<UserFollowing>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [NotMapped]
    [JsonIgnore]
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public static User Create(
        string userName,
        string email,
        string? displayName = null,
        string? bio = null,
        string? picture = null,
        bool emailConfirmed = false,
        string? id = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userName, nameof(userName));
        ArgumentException.ThrowIfNullOrWhiteSpace(email, nameof(email));

        var user = new User
        {
            UserName = userName.Trim(),
            Email = email.Trim(),
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? userName.Trim() : displayName.Trim(),
            Bio = string.IsNullOrWhiteSpace(bio) ? null : bio.Trim(),
            Picture = string.IsNullOrWhiteSpace(picture) ? null : picture.Trim(),
            EmailConfirmed = emailConfirmed
        };

        if (!string.IsNullOrWhiteSpace(id))
        {
            user.Id = id.Trim();
        }

        return user;
    }

    public void UpdateProfile(string displayName, string? bio)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName, nameof(displayName));

        DisplayName = displayName.Trim();
        Bio = string.IsNullOrWhiteSpace(bio) ? null : bio.Trim();

        AddDomainEvent(new UserProfileUpdatedEvent(Id, DisplayName));
    }

    public void UpdatePicture(string? pictureUrl)
    {
        Picture = string.IsNullOrWhiteSpace(pictureUrl) ? null : pictureUrl.Trim();
    }

    public void SetMainPhoto(Photo target, IEnumerable<Photo> userPhotos)
    {
        ArgumentNullException.ThrowIfNull(target);
        ArgumentNullException.ThrowIfNull(userPhotos);

        foreach (var photo in userPhotos)
        {
            if (photo.Id == target.Id)
                photo.MarkAsMain();
            else
                photo.UnmarkAsMain();
        }

        Picture = target.Url;
        AddDomainEvent(new UserMainPhotoChangedEvent(Id, target.Id, target.Url));
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        ArgumentNullException.ThrowIfNull(domainEvent);
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents() => _domainEvents.Clear();
}
