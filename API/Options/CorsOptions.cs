using System.ComponentModel.DataAnnotations;

namespace API.Options;

public class CorsOptions
{
    public const string SectionName = "Cors";

    [Required]
    public string[] AllowedOrigins { get; set; } =
    [
        "http://localhost:5173",
        "https://localhost:5173",
        "http://localhost:3000",
        "https://localhost:3000"
    ];
}
