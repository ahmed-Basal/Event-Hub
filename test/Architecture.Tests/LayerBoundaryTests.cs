using Application.Behaviors;
using BuildingBlocks.Contracts;
using Domain.Common;

namespace Architecture.Tests;

public class LayerBoundaryTests
{
    [Fact]
    public void BuildingBlocks_Domain_ShouldNotDependOn_Application_EF_Or_AspNetCore()
    {
        var domainAssembly = typeof(BaseEntity).Assembly;
        var referenced = domainAssembly.GetReferencedAssemblies()
            .Select(a => a.Name!)
            .ToList();

        Assert.DoesNotContain(referenced, r => r.Contains("BuildingBlocks.Application", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(referenced, r => r.Contains("EntityFrameworkCore", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(referenced, r => r.Contains("AspNetCore", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(referenced, r => r.Equals("API", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void BuildingBlocks_Contracts_ShouldNotDependOn_Application_Or_API()
    {
        var contractsAssembly = typeof(ICurrentUser).Assembly;
        var referenced = contractsAssembly.GetReferencedAssemblies()
            .Select(a => a.Name!)
            .ToList();

        Assert.DoesNotContain(referenced, r => r.Contains("BuildingBlocks.Application", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(referenced, r => r.Equals("API", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void BuildingBlocks_Application_ShouldNotDependOn_API()
    {
        var appAssembly = typeof(LoggingBehavior<,>).Assembly;
        var referenced = appAssembly.GetReferencedAssemblies()
            .Select(a => a.Name!)
            .ToList();

        Assert.DoesNotContain(referenced, r => r.Equals("API", StringComparison.OrdinalIgnoreCase));
    }
}
