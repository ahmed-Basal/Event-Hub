using System.ComponentModel.DataAnnotations;

namespace DevMeet.API.Options;

public sealed class HangfireOptions
{
    public const string SectionName = "Hangfire";

    public bool Enabled { get; set; } = true;

    [Required]
    public string DashboardPath { get; set; } = "/hangfire";

    [Required]
    public string SchemaName { get; set; } = "hangfire";

    [Range(1, 128)]
    public int WorkerCount { get; set; } = Math.Max(2, Environment.ProcessorCount * 2);

    public string[] Queues { get; set; } = ["critical", "default", "maintenance"];
}
