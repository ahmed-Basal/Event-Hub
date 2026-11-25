using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Profiles.Contracts;

namespace Profiles.Module.Infrastructure;

public sealed class CloudinarySettings
{
    public const string SectionName = "CloudinarySettings";
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}

public sealed record PhotoDto(string Id, string Url, bool IsMain);

public sealed record UserProfileDto(
    string Id,
    string Username,
    string DisplayName,
    string? Bio,
    string? Image,
    bool Following,
    int FollowersCount,
    int FollowingCount,
    List<PhotoDto> Photos);

public sealed record FollowerProfileDto(
    string Id,
    string Username,
    string DisplayName,
    string? Bio,
    string? Image,
    int FollowersCount,
    int FollowingCount,
    bool Following);

public sealed record PhotoUploadResult(string PublicId, string Url);

public interface IPhotoAccessor
{
    Task<PhotoUploadResult?> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default);
    Task<string> DeletePhotoAsync(string publicId, CancellationToken ct = default);
}

public sealed class PhotoAccessor : IPhotoAccessor
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<PhotoAccessor> _logger;

    public PhotoAccessor(IOptions<CloudinarySettings> config, ILogger<PhotoAccessor> logger)
    {
        _logger = logger;
        var settings = config.Value;
        if (!string.IsNullOrWhiteSpace(settings.CloudName) &&
            !string.IsNullOrWhiteSpace(settings.ApiKey) &&
            !string.IsNullOrWhiteSpace(settings.ApiSecret))
        {
            _cloudinary = new Cloudinary(new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret));
        }
    }

    public async Task<PhotoUploadResult?> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        if (_cloudinary is null)
        {
            _logger.LogWarning("Cloudinary is not configured.");
            return null;
        }

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Transformation = new Transformation().Height(500).Width(500).Crop("fill"),
            Folder = "devmeet"
        };

        var result = await _cloudinary.UploadAsync(uploadParams, ct);
        if (result.Error is not null)
        {
            _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
            return null;
        }

        return new PhotoUploadResult(result.PublicId, result.SecureUrl.AbsoluteUri);
    }

    public async Task<string> DeletePhotoAsync(string publicId, CancellationToken ct = default)
    {
        if (_cloudinary is null) return string.Empty;
        var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId));
        return result.Result == "ok" ? "ok" : string.Empty;
    }
}

public sealed class ProfilesDirectory(ProfilesDbContext db) : IProfilesDirectory
{
    public async Task<FollowStats> GetFollowStatsAsync(string targetUserId, string? currentUserId, CancellationToken ct = default)
    {
        var followersCount = await db.UserFollowings.CountAsync(f => f.TargetId == targetUserId, ct);
        var followingCount = await db.UserFollowings.CountAsync(f => f.ObserverId == targetUserId, ct);
        var isFollowing = !string.IsNullOrWhiteSpace(currentUserId) &&
            await db.UserFollowings.AnyAsync(f => f.ObserverId == currentUserId && f.TargetId == targetUserId, ct);

        return new FollowStats(followersCount, followingCount, isFollowing);
    }

    public async Task<IReadOnlyDictionary<string, FollowStats>> GetFollowStatsBatchAsync(
        IEnumerable<string> targetUserIds,
        string? currentUserId,
        CancellationToken ct = default)
    {
        var ids = targetUserIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<string, FollowStats>();

        var followers = await db.UserFollowings.AsNoTracking()
            .Where(f => ids.Contains(f.TargetId))
            .GroupBy(f => f.TargetId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        var following = await db.UserFollowings.AsNoTracking()
            .Where(f => ids.Contains(f.ObserverId))
            .GroupBy(f => f.ObserverId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        HashSet<string> followedByMe = [];
        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            followedByMe = (await db.UserFollowings.AsNoTracking()
                .Where(f => f.ObserverId == currentUserId && ids.Contains(f.TargetId))
                .Select(f => f.TargetId)
                .ToListAsync(ct)).ToHashSet();
        }

        return ids.ToDictionary(id => id, id => new FollowStats(
            followers.GetValueOrDefault(id, 0),
            following.GetValueOrDefault(id, 0),
            followedByMe.Contains(id)));
    }

    public async Task<IReadOnlyList<string>> GetFollowingUserIdsAsync(string observerId, CancellationToken ct = default)
    {
        return await db.UserFollowings.AsNoTracking()
            .Where(f => f.ObserverId == observerId)
            .Select(f => f.TargetId)
            .ToListAsync(ct);
    }
}
