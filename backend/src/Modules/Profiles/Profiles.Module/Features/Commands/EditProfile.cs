using DevMeet.Shared.Common;
using FastEndpoints;
using FluentValidation;
using Identity.Contracts;

namespace Profiles.Module.Features.Commands;

public sealed class EditProfileRequest
{
    public string DisplayName { get; init; } = string.Empty;
    public string? Bio { get; init; }
}

public sealed class EditProfileValidator : Validator<EditProfileRequest>
{
    public EditProfileValidator() => RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
}

public sealed class EditProfileEndpoint(IIdentityDirectory identity, ICurrentUser currentUser)
    : Endpoint<EditProfileRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Put("/api/profiles");
    }

    public override async Task HandleAsync(EditProfileRequest req, CancellationToken ct)
    {
        await identity.UpdateProfileAsync(currentUser.UserId, req.DisplayName, req.Bio, ct);
        await Send.OkAsync(ApiResponse<string>.Ok("Profile updated."), ct);
    }
}
