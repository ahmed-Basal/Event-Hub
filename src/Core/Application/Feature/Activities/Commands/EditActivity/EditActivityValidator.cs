using Core.Application.Feature.Activities.Commands.Base;
using FluentValidation;

namespace Core.Application.Feature.Activities.Commands.EditActivity;

public class EditActivityValidator : BaseActivityValidator<EditActivityCommand>
{
    public EditActivityValidator()
    {
        RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
    }
}
