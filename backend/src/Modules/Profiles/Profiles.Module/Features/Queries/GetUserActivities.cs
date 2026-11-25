using System.Net;
using Activities.Contracts;
using DevMeet.Shared.Common;
using FastEndpoints;
using Identity.Contracts;

namespace Profiles.Module.Features.Queries;

public sealed class GetUserActivitiesRequest
{
    public string Username { get; init; } = string.Empty;
    [QueryParam] public string Predicate { get; init; } = "future";
}

public sealed class GetUserActivitiesEndpoint(
    IIdentityDirectory identity,
    IActivitiesDirectory activities)
    : Endpoint<GetUserActivitiesRequest, ApiResponse<IReadOnlyList<UserActivityItem>>>
{
    public override void Configure()
    {
        Get("/api/profiles/{username}/activities");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetUserActivitiesRequest req, CancellationToken ct)
    {
        var user = await identity.GetByUsernameAsync(req.Username, ct);
        if (user is null)
        {
            await Send.ResponseAsync(ApiResponse<IReadOnlyList<UserActivityItem>>.Fail(HttpStatusCode.NotFound, "Profile not found."), 404, ct);
            return;
        }

        var items = await activities.GetUserActivitiesAsync(user.Id, req.Predicate, ct);
        await Send.OkAsync(ApiResponse<IReadOnlyList<UserActivityItem>>.Ok(items), ct);
    }
}
