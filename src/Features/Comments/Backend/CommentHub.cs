using Application.Feature.Comments.Commands.CreateComment;
using Application.Feature.Comments.Queries.GetComments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class CommentHub(ISender mediator) : Hub
{
    public async Task SendComment(CreateCommentCommand command)
    {
        var result = await mediator.Send(command);

        if (result.Succeeded && result.Data is not null)
        {
            await Clients.Group(command.ActivityId).SendAsync("ReceiveComment", result.Data);
        }
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

        var result = await mediator.Send(new GetCommentsQuery { ActivityId = activityId });
        if (result.Succeeded && result.Data is not null)
        {
            await Clients.Caller.SendAsync("LoadComments", result.Data);
        }

        await base.OnConnectedAsync();
    }
}
