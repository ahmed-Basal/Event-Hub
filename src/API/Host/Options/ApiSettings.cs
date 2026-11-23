using System.ComponentModel.DataAnnotations;

namespace API.Options;

/// <summary>
/// Strongly-typed configuration options for global API metadata and behaviors.
/// </summary>
public class ApiSettings
{
    public const string SectionName = "ApiSettings";

    [Required]
    public string Title { get; set; } = "DevMeet Egypt API";

    [Required]
    public string Version { get; set; } = "v1";

    public string Description { get; set; } = "REST API for DevMeet Egypt - Tech Events & Meetups Platform.";

    public string ContactName { get; set; } = "DevMeet Egypt Team";

    [EmailAddress]
    public string ContactEmail { get; set; } = "ahmedbassl913@devmeet.com";

    [Url]
    public string ContactUrl { get; set; } = "https://github.com/ahmed-Basal/Event-Hub";
}
