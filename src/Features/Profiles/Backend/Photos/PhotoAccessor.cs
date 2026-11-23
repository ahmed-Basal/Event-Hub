using System.Diagnostics;
using Application.Interfaces;
using Application.Observability;
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
        using var activity = DevMeetTelemetry.ActivitySource.StartActivity("Cloudinary: UploadPhoto", ActivityKind.Client);
        activity?.SetTag("dependency.name", "cloudinary");

        if (_cloudinary is null)
        {
            _logger.LogWarning("Cloudinary is not fully configured (CloudName/ApiKey/ApiSecret). Set values via dotnet user-secrets.");
            return null;
        }

        var sw = Stopwatch.StartNew();
        var outcome = "success";
        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Transformation = new Transformation().Height(500).Width(500).Crop("fill"),
                Folder = "devmeet"
            };

            var result = await _cloudinary.UploadAsync(uploadParams, ct);

            if (result.Error is not null)
            {
                outcome = "failure";
                _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                activity?.SetStatus(ActivityStatusCode.Error, result.Error.Message);
                return null;
            }

            activity?.SetStatus(ActivityStatusCode.Ok);
            return new PhotoUploadResult(result.PublicId, result.SecureUrl.AbsoluteUri);
        }
        catch (Exception ex)
        {
            outcome = "failure";
            DevMeetTelemetry.RecordException(activity, ex);
            throw;
        }
        finally
        {
            sw.Stop();
            var tags = new TagList { { "dependency", "cloudinary" }, { "operation", "upload_photo" }, { "outcome", outcome } };
            DevMeetTelemetry.DependencyCallsTotal.Add(1, tags);
            DevMeetTelemetry.DependencyDurationMs.Record(sw.Elapsed.TotalMilliseconds, tags);
        }
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
