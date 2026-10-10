using System.ComponentModel.DataAnnotations;

namespace API.Options;

public class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required]
    public string DefaultConnection { get; set; } = string.Empty;
}
