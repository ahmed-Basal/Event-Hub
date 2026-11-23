namespace Infrastructure.Security;

public class KeycloakOptions
{
    public const string SectionName = "Keycloak";

    public bool Enabled { get; set; } = true;
    public string Authority { get; set; } = "http://localhost:8082/realms/reactivities";
    public string Audience { get; set; } = "account";
    public bool RequireHttpsMetadata { get; set; } = false;
    public string? ValidIssuer { get; set; }
}
