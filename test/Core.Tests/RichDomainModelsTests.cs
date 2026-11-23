using Domain;
using Domain.Events;
using Xunit;

namespace Application.Tests;

public class RichDomainModelsTests
{
    [Fact]
    public void Activity_Create_ShouldInitializeAndRaiseCreatedEvent()
    {
        var activity = Activity.Create(
            title: "  .NET 11 Conf  ",
            description: "Deep dive",
            category: "BackEnd",
            date: DateTimeOffset.UtcNow.AddDays(5),
            city: "Cairo",
            venue: "Greek Campus",
            latitude: 30.04,
            longitude: 31.23,
            price: -10m,
            currency: "USD");

        Assert.Equal(".NET 11 Conf", activity.Title);
        Assert.Equal(0m, activity.Price);
        Assert.Equal("usd", activity.Currency);
        Assert.False(activity.IsCancelled);
        var ev = Assert.Single(activity.DomainEvents);
        var created = Assert.IsType<ActivityCreatedEvent>(ev);
        Assert.Equal(activity.Id, created.ActivityId);
    }

    [Fact]
    public void Activity_AddAndRemoveAttendee_ShouldRespectHostRulesAndEvents()
    {
        var activity = Activity.Create(
            "Meetup", "Desc", "BackEnd", DateTimeOffset.UtcNow.AddDays(2),
            "Cairo", "Venue", 30.0, 31.0);
        activity.ClearDomainEvents();

        activity.AddAttendee("host-1", isHost: true);
        Assert.Empty(activity.DomainEvents); // Host join does not raise ActivityAttendeeJoinedEvent

        activity.AddAttendee("user-2", isHost: false);
        var joined = Assert.IsType<ActivityAttendeeJoinedEvent>(Assert.Single(activity.DomainEvents));
        Assert.Equal("user-2", joined.UserId);
        Assert.False(joined.IsHost);

        activity.ClearDomainEvents();
        Assert.False(activity.RemoveAttendee("host-1")); // Cannot remove host
        Assert.Empty(activity.DomainEvents);

        Assert.True(activity.RemoveAttendee("user-2"));
        var left = Assert.IsType<ActivityAttendeeLeftEvent>(Assert.Single(activity.DomainEvents));
        Assert.Equal("user-2", left.UserId);
    }

    [Fact]
    public void Activity_CancelAndReactivate_ShouldBeIdempotentAndRaiseEvents()
    {
        var activity = Activity.Create(
            "Meetup", "Desc", "BackEnd", DateTimeOffset.UtcNow.AddDays(2),
            "Cairo", "Venue", 30.0, 31.0);
        activity.ClearDomainEvents();

        activity.Cancel("host-1");
        activity.Cancel("host-1"); // Idempotent
        Assert.True(activity.IsCancelled);
        var cancelled = Assert.IsType<ActivityCancelledEvent>(Assert.Single(activity.DomainEvents));
        Assert.Equal("host-1", cancelled.ActorUserId);

        activity.ClearDomainEvents();
        activity.Reactivate("host-1");
        activity.Reactivate("host-1"); // Idempotent
        Assert.False(activity.IsCancelled);
        var reactivated = Assert.IsType<ActivityReactivatedEvent>(Assert.Single(activity.DomainEvents));
        Assert.Equal("host-1", reactivated.ActorUserId);
    }

    [Fact]
    public void Comment_Create_ShouldTrimAndRaiseCommentCreatedEvent()
    {
        var comment = Comment.Create("act-1", "user-1", "  Great session!  ");

        Assert.Equal("Great session!", comment.Body);
        var ev = Assert.IsType<CommentCreatedEvent>(Assert.Single(comment.DomainEvents));
        Assert.Equal("act-1", ev.ActivityId);
        Assert.Equal("user-1", ev.AuthorUserId);
        Assert.Equal("Great session!", ev.Body);
    }

    [Fact]
    public void TicketOrder_Lifecycle_ShouldEnforceInvariantsAndRaiseEvents()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TicketOrder.Create("act-1", "user-1", 0m));

        var order = TicketOrder.Create("act-1", "user-1", 50m, "USD");
        Assert.Equal(PaymentStatus.Pending, order.Status);
        Assert.Equal("usd", order.Currency);
        Assert.Throws<InvalidOperationException>(() => order.MarkRefunded());

        order.ClearDomainEvents();
        order.AttachStripeSession("cs_test_123");
        Assert.Equal("cs_test_123", order.StripeSessionId);

        order.MarkPaid("pi_123");
        order.MarkPaid("pi_123"); // Idempotent
        Assert.Equal(PaymentStatus.Paid, order.Status);
        Assert.IsType<TicketOrderPaidEvent>(Assert.Single(order.DomainEvents));

        order.ClearDomainEvents();
        order.MarkRefunded();
        Assert.Equal(PaymentStatus.Refunded, order.Status);
        Assert.IsType<TicketOrderRefundedEvent>(Assert.Single(order.DomainEvents));
    }

    [Fact]
    public void UserFollowing_Create_ShouldPreventSelfFollowAndRaiseEvents()
    {
        Assert.Throws<InvalidOperationException>(() =>
            UserFollowing.Create("user-1", "user-1"));

        var following = UserFollowing.Create("user-1", "user-2");
        Assert.IsType<UserFollowedEvent>(Assert.Single(following.DomainEvents));

        following.ClearDomainEvents();
        following.MarkUnfollowed();
        Assert.IsType<UserUnfollowedEvent>(Assert.Single(following.DomainEvents));
    }

    [Fact]
    public void User_SetMainPhoto_And_UpdateProfile_ShouldUpdateStateAndRaiseEvents()
    {
        var user = User.Create("ahmed", "ahmed@devmeet.com");
        var p1 = Photo.Create("p1", "https://img/1.png", user.Id, isMain: true);
        var p2 = Photo.Create("p2", "https://img/2.png", user.Id, isMain: false);

        user.SetMainPhoto(p2, [p1, p2]);
        Assert.False(p1.IsMain);
        Assert.True(p2.IsMain);
        Assert.Equal("https://img/2.png", user.Picture);
        Assert.IsType<UserMainPhotoChangedEvent>(Assert.Single(user.DomainEvents));

        user.ClearDomainEvents();
        user.UpdateProfile("Ahmed Saad", "Architect");
        Assert.Equal("Ahmed Saad", user.DisplayName);
        Assert.Equal("Architect", user.Bio);
        Assert.IsType<UserProfileUpdatedEvent>(Assert.Single(user.DomainEvents));
    }

    [Fact]
    public void RefreshToken_Revoke_ShouldBeIdempotentAndRaiseEvent()
    {
        var token = RefreshToken.Create("user-1", "tok-123", DateTimeOffset.UtcNow.AddDays(7), "127.0.0.1");
        Assert.True(token.IsActive);

        token.Revoke("127.0.0.2", "tok-456");
        token.Revoke("127.0.0.3", "tok-789");

        Assert.True(token.IsRevoked);
        Assert.False(token.IsActive);
        Assert.Equal("tok-456", token.ReplacedByToken);
        var ev = Assert.IsType<RefreshTokenRevokedEvent>(Assert.Single(token.DomainEvents));
        Assert.Equal("127.0.0.2", ev.RevokedByIp);
    }

    [Fact]
    public void Notification_CreateAndMarkAsRead_ShouldWork()
    {
        var notification = Notification.Create(
            recipientId: "user-1",
            type: NotificationType.NewFollower,
            message: "  Ahmed followed you  ",
            actorId: "user-2",
            targetUrl: "/profiles/ahmed");

        Assert.False(notification.IsRead);
        Assert.Equal("Ahmed followed you", notification.Message);

        notification.MarkAsRead();
        Assert.True(notification.IsRead);
    }
}
