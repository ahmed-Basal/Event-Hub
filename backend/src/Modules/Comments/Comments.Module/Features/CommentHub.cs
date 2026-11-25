using System.Security.Claims;
using Comments.Module.Domain;
using Comments.Module.Infrastructure;
using Identity.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Comments.Module.Features;

public sealed record CommentDto(
    string Id,
    string Body,
    DateTimeOffset CreatedAt,
    string UserId,
    string Username,
    string DisplayName,
    string? Image);

public sealed record CreateCommentRequest(string ActivityId, string Body);

[Authorize]
public sealed class CommentHub(
    CommentsDbContext db,
    IIdentityDirectory identity) : Hub
{
    public async Task SendComment(CreateCommentRequest request)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(request.Body))
            return;

        var user = await identity.GetByIdAsync(userId);
        if (user is null) return;

        var comment = Comment.Create(request.ActivityId, userId, request.Body);
        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        var dto = new CommentDto(
            comment.Id,
            comment.Body,
            comment.CreatedAt,
            user.Id,
            user.UserName,
            user.DisplayName,
            user.Picture);

        await Clients.Group(request.ActivityId).SendAsync("ReceiveComment", dto);
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var activityId = httpContext?.Request.Query["activityId"].ToString();

        if (string.IsNullOrWhiteSpace(activityId))
        {
            throw new HubException("No activityId supplied in query string.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, activityId);

        var comments = await db.Comments.AsNoTracking()
            .Where(c => c.ActivityId == activityId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var users = await identity.GetByIdsAsync(comments.Select(c => c.UserId));
        var dtos = comments.Select(c =>
        {
            users.TryGetValue(c.UserId, out var u);
            return new CommentDto(
                c.Id,
                c.Body,
                c.CreatedAt,
                c.UserId,
                u?.UserName ?? string.Empty,
                u?.DisplayName ?? "User",
                u?.Picture);
        }).ToList();

        await Clients.Caller.SendAsync("LoadComments", dtos);
        await base.OnConnectedAsync();
    }
}
