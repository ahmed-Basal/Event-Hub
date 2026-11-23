using Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Photos;

public class PhotoAccessor : IPhotoAccessor
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
            var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }
    }

    public async Task<PhotoUploadResult?> UploadPhotoAsync(
        Stream fileStream,
        string fileName,
        CancellationToken ct = default)
    {
        if (_cloudinary is null)
        {
            _logger.LogWarning("Cloudinary is not fully configured (CloudName/ApiKey/ApiSecret). Set values via dotnet user-secrets.");
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

    public async Task<bool> DeletePhotoAsync(string publicId, CancellationToken ct = default)
    {
        if (_cloudinary is null)
        {
            _logger.LogWarning("Cloudinary is not configured; skipping remote delete for {PublicId}.", publicId);
            return true;
        }

        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok" || result.Result == "not found";
    }
}
