using Domain.Common;

namespace Application.Mapping.Common;

/// <summary>
/// Centralized mapping defaults, fallback constants, and value resolution helpers.
/// </summary>
public static class MappingDefaults
{
    public const string DefaultCategory = "BackEnd";
    public const string DefaultUserImage = "/images/user.png";
    public const string CategoryImagesBasePath = "/images/categoryImages";
    public const double DefaultLatitude = 30.0444;
    public const double DefaultLongitude = 31.2357;

    public static string ResolveSlug(string? title) =>
        !string.IsNullOrWhiteSpace(title) ? SlugHelper.GenerateSlug(title) : string.Empty;

    public static string ResolveCategory(string? category) =>
        !string.IsNullOrWhiteSpace(category) ? category.Trim() : DefaultCategory;

    public static double ResolveCoordinate(double value, double fallback) =>
        value != 0 ? value : fallback;

    public static string ResolveCategoryImage(string? image, string? category, string? currentImage = null)
    {
        if (!string.IsNullOrWhiteSpace(image))
            return image.Trim();

        if (!string.IsNullOrWhiteSpace(currentImage))
            return currentImage;

        var cat = ResolveCategory(category);
        return $"{CategoryImagesBasePath}/{cat.ToLowerInvariant()}.jpg";
    }
}
