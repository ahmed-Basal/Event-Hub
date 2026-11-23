using FluentValidation;

namespace Application.Feature.Activities.Commands.DeleteActivity;

public class DeleteActivityValidator : AbstractValidator<DeleteActivityCommand>
{
    public DeleteActivityValidator()
    {
        RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
    }
}
