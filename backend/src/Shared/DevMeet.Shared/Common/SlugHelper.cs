using System.Text.RegularExpressions;

namespace DevMeet.Shared.Common;

public static partial class SlugHelper
{
    public static string GenerateSlug(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;
        var slug = title.Trim().ToLowerInvariant();
        slug = InvalidCharsRegex().Replace(slug, "");
        slug = WhitespaceOrHyphensRegex().Replace(slug, "-").Trim('-');
        return slug;
    }

    [GeneratedRegex(@"[^\p{L}\p{N}\s-]")]
    private static partial Regex InvalidCharsRegex();

    [GeneratedRegex(@"[\s-]+")]
    private static partial Regex WhitespaceOrHyphensRegex();
}
