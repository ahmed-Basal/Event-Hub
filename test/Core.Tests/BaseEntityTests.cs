using Core.Domain;
using Core.Domain.Common;
using Xunit;

namespace Core.Application.Tests;

public class BaseEntityTests
{
    private class DummyBaseEntity : BaseEntity<int>
    {
    }

    private class DummyAuditableEntity : AuditableEntity<int>
    {
    }

    [Fact]
    public void BaseEntityGeneric_ShouldInitializeWithDefaultValues()
    {
        var entity = new DummyBaseEntity { Id = 42 };

        Assert.Equal(42, entity.Id);
    }

    [Fact]
    public void AuditableEntity_ShouldInitializeWithDefaultValues()
    {
        var entity = new DummyAuditableEntity { Id = 42 };

        Assert.Equal(42, entity.Id);
        Assert.True(entity.CreatedAtUtc <= DateTimeOffset.UtcNow);
        Assert.Null(entity.LastModifiedUtc);
        Assert.Null(entity.CreatedBy);
        Assert.Null(entity.LastModifiedBy);
        Assert.IsAssignableFrom<BaseEntity<int>>(entity);
    }

    [Fact]
    public void BaseEntity_ShouldGenerateGuidStringIdByDefault()
    {
        var activity = Activity.Create(
            title: "Cairo .NET Meetup",
            description: "Community discussion",
            category: "culture",
            date: DateTimeOffset.UtcNow.AddDays(7),
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
        Assert.IsAssignableFrom<AuditableEntity>(activity);
        Assert.IsAssignableFrom<AuditableEntity<string>>(activity);
        Assert.IsAssignableFrom<AuditEntity>(activity);
    }
}
