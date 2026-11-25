using System.Security.Claims;
using Identity.Module.Infrastructure;

namespace Core.Tests;

public class KeycloakClaimsTransformationTests
{
    [Fact]
    public async Task TransformAsync_ShouldMapRealmAccessRolesAndSubject()
    {
        var claims = new[]
        {
            new Claim("sub", "kc-user-123"),
            new Claim("preferred_username", "ahmed"),
            new Claim("email", "ahmed@devmeet.eg"),
            new Claim("realm_access", """{"roles":["Admin","Organizer","User"]}""")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Keycloak"));
        var transformer = new KeycloakClaimsTransformation();

        var transformed = await transformer.TransformAsync(principal);

        Assert.Equal("kc-user-123", transformed.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("ahmed", transformed.FindFirstValue(ClaimTypes.Name));
        Assert.Equal("ahmed@devmeet.eg", transformed.FindFirstValue(ClaimTypes.Email));
        Assert.True(transformed.IsInRole("Admin"));
        Assert.True(transformed.IsInRole("Organizer"));
        Assert.True(transformed.IsInRole("User"));
    }

    [Fact]
    public async Task TransformAsync_ShouldBeIdempotent_AndNotDuplicateRoles()
    {
        var claims = new[]
        {
            new Claim("sub", "kc-user-123"),
            new Claim("roles", "Admin"),
            new Claim("realm_access", """{"roles":["Admin","User"]}""")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Keycloak"));
        var transformer = new KeycloakClaimsTransformation();

        await transformer.TransformAsync(principal);
        var secondPass = await transformer.TransformAsync(principal);

        var adminRoles = secondPass.FindAll(ClaimTypes.Role)
            .Where(c => c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            .ToList();
        Assert.Single(adminRoles);
    }
}
