using Application.Feature.Activities.DTO;
using Application.Feature.Activities.command.Models;
using FluentValidation;

namespace Application.Feature.Activities.command.Validation;

public class EditActivityValidator : BaseActivityValidator<EditActivityCommand, EditActivityDto>
{
    public EditActivityValidator() : base(x => x.ActivityDto)
    {
        RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
    }
}
