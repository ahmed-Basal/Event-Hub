using Core.Domain;
using Core.Domain.Common;
using Xunit;

namespace Core.Application.Tests;

public class BaseEntityTests
{
    private class DummyEntity : BaseEntity<int>
    {
    }

    [Fact]
    public void BaseEntityGeneric_ShouldInitializeWithDefaultValues()
    {
        var entity = new DummyEntity { Id = 42 };

        Assert.Equal(42, entity.Id);
        Assert.True(entity.CreatedAtUtc <= DateTime.UtcNow);
        Assert.Null(entity.LastModifiedUtc);
    }

    [Fact]
    public void BaseEntity_ShouldGenerateGuidStringIdByDefault()
    {
        var activity = Activity.Create(
            title: "Cairo .NET Meetup",
            description: "Community discussion",
            category: "culture",
            date: DateTime.UtcNow.AddDays(7),
            city: "Cairo",
            venue: "Downtown",
            latitude: 30.0444,
            longitude: 31.2357
        );

        Assert.NotNull(activity.Id);
        Assert.NotEmpty(activity.Id);
        Assert.Equal(activity.Id, activity.ID);
        Assert.IsAssignableFrom<BaseEntity>(activity);
        Assert.IsAssignableFrom<BaseEntity<string>>(activity);
    }
}
