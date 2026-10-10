using API.Configuration;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Core.Application.Tests;

public class ApiConfigurationTests
{
    [Fact]
    public void AddCoreApiConfiguration_ShouldSetLowercaseRoutingOptions()
    {
        var services = new ServiceCollection();
        services.AddCoreApiConfiguration();
        var provider = services.BuildServiceProvider();

        var routeOptions = provider.GetRequiredService<IOptions<RouteOptions>>().Value;

        Assert.True(routeOptions.LowercaseUrls);
        Assert.True(routeOptions.LowercaseQueryStrings);
    }

    [Fact]
    public void AddVersioningConfiguration_ShouldSetExpectedDefaultVersion()
    {
        var services = new ServiceCollection();
        services.AddVersioningConfiguration();
        var provider = services.BuildServiceProvider();

        var versioningOptions = provider.GetRequiredService<IOptions<ApiVersioningOptions>>().Value;

        Assert.True(versioningOptions.AssumeDefaultVersionWhenUnspecified);
        Assert.True(versioningOptions.ReportApiVersions);
        Assert.Equal(new ApiVersion(1, 0), versioningOptions.DefaultApiVersion);
    }
}
