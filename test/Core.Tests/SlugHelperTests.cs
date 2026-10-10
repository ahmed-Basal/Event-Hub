using Core.Domain.Common;
using Xunit;

namespace Core.Application.Tests;

public class SlugHelperTests
{
    [Theory]
    [InlineData("Tech Meetup Cairo", "tech-meetup-cairo")]
    [InlineData("DotNet 11 & React 19!", "dotnet-11-react-19")]
    [InlineData("   Spaced   Event   ", "spaced-event")]
    [InlineData("", "")]
    [InlineData(null, "")]
    public void GenerateSlug_ShouldReturnExpectedSlug(string? input, string expected)
    {
        // Act
        var result = SlugHelper.GenerateSlug(input);

        // Assert
        Assert.Equal(expected, result);
    }
}
