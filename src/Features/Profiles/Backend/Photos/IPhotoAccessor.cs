namespace Application.Interfaces;

public record PhotoUploadResult(string PublicId, string Url);

public interface IPhotoAccessor
{
    Task<PhotoUploadResult?> UploadPhotoAsync(Stream fileStream, string fileName, CancellationToken ct = default);
    Task<bool> DeletePhotoAsync(string publicId, CancellationToken ct = default);
}
