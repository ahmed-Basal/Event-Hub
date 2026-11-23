using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace Infrastructure.Security;

/// <summary>
/// Normalizes Keycloak OIDC JWT claims (realm_access.roles, roles, sub, preferred_username)
/// into standard ASP.NET Core ClaimTypes so [Authorize(Roles = ...)] and resource handlers work uniformly.
/// </summary>
public sealed class KeycloakClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
        {
            return Task.FromResult(principal);
        }

        // 1. Normalize subject -> ClaimTypes.NameIdentifier
        if (!identity.HasClaim(c => c.Type == ClaimTypes.NameIdentifier))
        {
            var sub = identity.FindFirst("sub")?.Value;
            if (!string.IsNullOrWhiteSpace(sub))
            {
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, sub));
            }
        }

        // 2. Normalize preferred_username -> ClaimTypes.Name
        if (!identity.HasClaim(c => c.Type == ClaimTypes.Name))
        {
            var username = identity.FindFirst("preferred_username")?.Value;
            if (!string.IsNullOrWhiteSpace(username))
            {
                identity.AddClaim(new Claim(ClaimTypes.Name, username));
            }
        }

        // 3. Map top-level "roles" claims -> ClaimTypes.Role
        var existingRoles = identity.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var roleValue in identity.FindAll("roles").Select(c => c.Value).ToList())
        {
            if (!string.IsNullOrWhiteSpace(roleValue) && existingRoles.Add(roleValue))
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
            }
        }

        // 4. Fallback: extract Keycloak's nested realm_access.roles JSON array
        var realmAccessJson = identity.FindFirst("realm_access")?.Value;
        if (!string.IsNullOrWhiteSpace(realmAccessJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(realmAccessJson);
                if (doc.RootElement.TryGetProperty("roles", out var rolesElement) &&
                    rolesElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        var roleName = role.GetString();
                        if (!string.IsNullOrWhiteSpace(roleName) && existingRoles.Add(roleName))
                        {
                            identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
                        }
                    }
                }
            }
            catch (JsonException)
            {
                // Ignore malformed realm_access claim
            }
        }

        return Task.FromResult(principal);
    }
}
