using Activities.Module.Domain;
using Comments.Module.Domain;
using DevMeet.Shared.Common;
using Identity.Module.Domain;
using Notifications.Contracts;
using Notifications.Module.Domain;
using Payments.Module.Domain;
using Profiles.Module.Domain;

namespace Core.Tests;

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
            currency: "USD",
            maxCapacity: 50);

        Assert.Equal(".NET 11 Conf", activity.Title);
        Assert.Equal(0m, activity.Price);
        Assert.Equal("usd", activity.Currency);
        Assert.Equal(50, activity.MaxCapacity);
        Assert.False(activity.IsCancelled);
        var ev = Assert.Single(activity.DomainEvents);
        var created = Assert.IsType<ActivityCreatedEvent>(ev);
        Assert.Equal(activity.Id, created.ActivityId);
    }

    [Fact]
    public void Activity_CapacityAndWaitlist_ShouldPromoteNextUserWhenSpotOpens()
    {
        var activity = Activity.Create(
            "Meetup", "Desc", "BackEnd", DateTimeOffset.UtcNow.AddDays(2),
            "Cairo", "Venue", 30.0, 31.0, maxCapacity: 2);
        activity.AddAttendee("host-1", isHost: true, raiseEvent: false);
        activity.AddAttendee("user-2", isHost: false, raiseEvent: false);
        activity.ClearDomainEvents();

        Assert.True(activity.IsFull);
        Assert.True(activity.JoinWaitlist("user-3", DateTimeOffset.UtcNow.AddMinutes(-10)));
        Assert.True(activity.JoinWaitlist("user-4", DateTimeOffset.UtcNow.AddMinutes(-5)));
        Assert.False(activity.JoinWaitlist("user-3")); // duplicate prevented
        Assert.Equal(2, activity.Waitlist.Count);

        Assert.True(activity.RemoveAttendee("user-2"));
        var promotedId = activity.PopNextWaitlistedUser();

        Assert.Equal("user-3", promotedId);
        Assert.Contains(activity.Attendees, a => a.UserId == "user-3");
        Assert.Single(activity.Waitlist);
        Assert.Contains(activity.DomainEvents, e => e is WaitlistUserPromotedEvent promoted && promoted.UserId == "user-3");
    }

    [Fact]
    public void Activity_MarkReminderSent_ShouldSetTimestampOnce()
    {
        var activity = Activity.Create(
            "Meetup", "Desc", "BackEnd", DateTimeOffset.UtcNow.AddHours(12),
            "Cairo", "Venue", 30.0, 31.0);

        Assert.Null(activity.ReminderSentAtUtc);
        activity.MarkReminderSent();
        var first = activity.ReminderSentAtUtc;
        Assert.NotNull(first);

        activity.MarkReminderSent();
        Assert.Equal(first, activity.ReminderSentAtUtc);
    }

    [Fact]
    public void Activity_CancelAndReactivate_ShouldBeIdempotentAndRaiseEvents()
    {
        var activity = Activity.Create(
            "Meetup", "Desc", "BackEnd", DateTimeOffset.UtcNow.AddDays(2),
            "Cairo", "Venue", 30.0, 31.0);
        activity.ClearDomainEvents();

        activity.Cancel("host-1");
        activity.Cancel("host-1");
        Assert.True(activity.IsCancelled);
        var cancelled = Assert.IsType<ActivityCancelledEvent>(Assert.Single(activity.DomainEvents));
        Assert.Equal("host-1", cancelled.ActorUserId);

        activity.ClearDomainEvents();
        activity.Reactivate("host-1");
        activity.Reactivate("host-1");
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
        Assert.Equal("user-1", ev.UserId);
        Assert.Equal("Great session!", ev.Body);
    }

    [Fact]
    public void TicketOrder_LifecycleAndCheckIn_ShouldEnforceInvariantsAndGenerateCode()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            TicketOrder.Create("act-1", "user-1", 0m));

        var order = TicketOrder.Create("act-1", "user-1", 50m, "USD");
        Assert.Equal(PaymentStatus.Pending, order.Status);
        Assert.Equal("usd", order.Currency);
        Assert.Throws<InvalidOperationException>(() => order.MarkRefunded());
        Assert.Throws<InvalidOperationException>(() => order.CheckIn("host-1"));

        order.ClearDomainEvents();
        order.AttachStripeSession("cs_test_123");
        Assert.Equal("cs_test_123", order.StripeSessionId);

        order.MarkPaid("pi_123");
        order.MarkPaid("pi_123"); // Idempotent
        Assert.Equal(PaymentStatus.Paid, order.Status);
        Assert.StartsWith("DEVMEET-", order.CheckInCode);
        Assert.IsType<TicketOrderPaidEvent>(Assert.Single(order.DomainEvents));

        order.ClearDomainEvents();
        order.CheckIn("organizer-1");
        Assert.NotNull(order.CheckedInAtUtc);
        Assert.Equal("organizer-1", order.CheckedInByUserId);
        Assert.IsType<TicketCheckedInEvent>(Assert.Single(order.DomainEvents));
        Assert.Throws<InvalidOperationException>(() => order.CheckIn("organizer-1"));

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
    public void AppUser_CreateSyncAndRoles_ShouldEnforceInvariants()
    {
        var user = AppUser.Create(
            id: "kc-sub-1",
            userName: "sara",
            email: "sara@devmeet.eg",
            roles: [AppRoles.Organizer, "invalid-role"]);

        Assert.Equal("kc-sub-1", user.Id);
        Assert.Single(user.Roles);
        Assert.Contains(AppRoles.Organizer, user.Roles);

        user.UpdateProfile("Sara Hassan", "Cloud Architect");
        Assert.Equal("Sara Hassan", user.DisplayName);
        Assert.Equal("Cloud Architect", user.Bio);
        Assert.IsType<UserProfileUpdatedEvent>(Assert.Single(user.DomainEvents));

        user.ClearDomainEvents();
        user.UpdatePicture("https://img/avatar.png");
        Assert.Equal("https://img/avatar.png", user.Picture);
        Assert.IsType<UserMainPhotoChangedEvent>(Assert.Single(user.DomainEvents));

        user.ClearDomainEvents();
        user.SetRoles([]);
        Assert.Contains(AppRoles.User, user.Roles); // defaults to User
        Assert.IsType<UserRolesUpdatedEvent>(Assert.Single(user.DomainEvents));
    }

    [Fact]
    public void Notification_CreateAndMarkAsRead_ShouldWork()
    {
        var notification = Notification.Create(
            recipientId: "user-1",
            type: NotificationType.WaitlistPromoted,
            message: "  Spot confirmed  ",
            actorId: "user-2",
            targetUrl: "/activities/act-1");

        Assert.False(notification.IsRead);
        Assert.Equal("Spot confirmed", notification.Message);

        notification.MarkAsRead();
        Assert.True(notification.IsRead);
    }
}
