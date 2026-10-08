namespace Domain;

public partial class Activity
{
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        if (!Tags.Contains(clean, StringComparer.OrdinalIgnoreCase))
        {
            Tags.Add(clean);
        }
    }

    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var clean = tag.Trim().TrimStart('#');
        Tags.RemoveAll(t => t.Equals(clean, StringComparison.OrdinalIgnoreCase));
    }

    public void SetTags(IEnumerable<string> tags)
    {
        Tags.Clear();
        foreach (var tag in tags)
        {
            AddTag(tag);
        }
    }
}
