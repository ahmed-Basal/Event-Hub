using System.Text.RegularExpressions;

namespace Core.Domain.Common;

public static class SlugHelper
{
    public static string GenerateSlug(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;

        var slug = title.Trim().ToLowerInvariant();

        slug = Regex.Replace(slug, @"[^\p{L}\p{N}\s-]", "");

        slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');

        return slug;
    }
}
