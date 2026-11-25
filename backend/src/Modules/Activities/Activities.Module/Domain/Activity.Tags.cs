namespace Activities.Module.Domain;

public sealed partial class Activity
{
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        if (!_tags.Contains(clean, StringComparer.OrdinalIgnoreCase)) _tags.Add(clean);
    }

    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        _tags.RemoveAll(t => string.Equals(t, clean, StringComparison.OrdinalIgnoreCase));
    }

    public void SetTags(IEnumerable<string> tags)
    {
        _tags.Clear();
        foreach (var tag in tags) AddTag(tag);
    }
}
