using System.Text.RegularExpressions;

namespace Domain.Common;

public static class SlugHelper
{
    public static string GenerateSlug(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;

        // Convert to lowercase
        var slug = title.Trim().ToLowerInvariant();

        // Keep letters (including Unicode / Arabic letters), numbers, whitespace, and hyphens
        slug = Regex.Replace(slug, @"[^\p{L}\p{N}\s-]", "");

        // Convert spaces and repeated hyphens into a single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');

        return slug;
    }
}
