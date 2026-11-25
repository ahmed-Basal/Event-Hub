using Notifications.Contracts;
using Notifications.Module.Domain;
using Notifications.Module.Infrastructure;

namespace Core.Tests;

public class SseNotificationBrokerTests
{
    [Fact]
    public void Ticket_ShouldBeSingleUse_AndReturnUserIdOnce()
    {
        var broker = new SseNotificationBroker();
        var ticket = broker.CreateTicket("user-123");

        Assert.False(string.IsNullOrWhiteSpace(ticket));
        Assert.Equal("user-123", broker.RedeemTicket(ticket));
        Assert.Null(broker.RedeemTicket(ticket));
    }

    [Fact]
    public async Task PublishAsync_ShouldDeliverToSubscribedUser()
    {
        var broker = new SseNotificationBroker();
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

        var received = new TaskCompletionSource<NotificationDto>();
        var readTask = Task.Run(async () =>
        {
            await foreach (var item in broker.SubscribeAsync("user-42", cts.Token))
            {
                received.TrySetResult(item);
                break;
            }
        }, cts.Token);

        await Task.Delay(50, cts.Token);

        var payload = new NotificationDto(
            Id: "notif-1",
            Type: NotificationType.NewFollower.ToString(),
            Message: "Bob started following you.",
            TargetUrl: "/profiles/bob",
            IsRead: false,
            CreatedAt: DateTimeOffset.UtcNow,
            ActorUsername: "bob",
            ActorDisplayName: "Bob Smith",
            ActorImage: null);

        await broker.PublishAsync("user-42", payload, cts.Token);

        var result = await received.Task;
        Assert.Equal("notif-1", result.Id);
        Assert.Equal("Bob started following you.", result.Message);

        cts.Cancel();
        await Task.WhenAny(readTask, Task.Delay(200));
    }

    [Fact]
    public void Notification_MarkAsRead_SetsIsReadTrue()
    {
        var n = Notification.Create(
            recipientId: "u1",
            type: NotificationType.NewComment,
            message: "New comment");

        Assert.False(n.IsRead);
        n.MarkAsRead();
        Assert.True(n.IsRead);
    }
}
