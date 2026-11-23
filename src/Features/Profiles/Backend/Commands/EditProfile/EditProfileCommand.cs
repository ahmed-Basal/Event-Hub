using Application.Bases;
using Application.Interfaces;
using FluentValidation;
using MediatR;

namespace Application.Feature.Profiles.Commands.EditProfile;

public class EditProfileCommand : IRequest<Response<string>>
{
    public required string DisplayName { get; set; }
    public string? Bio { get; set; }
}

public class EditProfileValidator : AbstractValidator<EditProfileCommand>
{
    public EditProfileValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Bio).MaximumLength(1000);
    }
}

public class EditProfileCommandHandler(IAppDbContext dbContext, IUserAccessor userAccessor)
    : ResponseHandler, IRequestHandler<EditProfileCommand, Response<string>>
{
    public async Task<Response<string>> Handle(
        EditProfileCommand request,
        CancellationToken cancellationToken)
    {
        var user = await userAccessor.GetUserAsync();
        user.UpdateProfile(request.DisplayName, request.Bio);

        await dbContext.SaveChangesAsync(cancellationToken);
        return Success(user.UserName ?? user.Id);
    }
}
