using API.Options;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Core.Application.Tests;

public class ApiSettingsTests
{
    [Fact]
    public void ApiSettings_DefaultProperties_ShouldHaveValidValues()
    {
        var settings = new ApiSettings();

        Assert.Equal("ApiSettings", ApiSettings.SectionName);
        Assert.Equal("DevMeet Egypt API", settings.Title);
        Assert.Equal("v1", settings.Version);
        Assert.False(string.IsNullOrWhiteSpace(settings.ContactEmail));
        Assert.False(string.IsNullOrWhiteSpace(settings.ContactUrl));
    }

    [Fact]
    public void ApiSettings_ConfigurationBinding_ShouldPopulateCorrectly()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            [$"{ApiSettings.SectionName}:Title"] = "Custom API",
            [$"{ApiSettings.SectionName}:Version"] = "v2",
            [$"{ApiSettings.SectionName}:Description"] = "Custom Description",
            [$"{ApiSettings.SectionName}:ContactEmail"] = "custom@devmeet.eg"
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var settings = configuration.GetSection(ApiSettings.SectionName).Get<ApiSettings>();

        Assert.NotNull(settings);
        Assert.Equal("Custom API", settings.Title);
        Assert.Equal("v2", settings.Version);
        Assert.Equal("Custom Description", settings.Description);
        Assert.Equal("custom@devmeet.eg", settings.ContactEmail);
    }
}
