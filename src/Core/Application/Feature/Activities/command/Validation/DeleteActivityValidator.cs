using Core.Application.Feature.Activities.command.Models;
using FluentValidation;

namespace Core.Application.Feature.Activities.command.Validation;

public class DeleteActivityValidator : AbstractValidator<DeleteActivityCommand>
{
    public DeleteActivityValidator()
    {
        RuleFor(x => x.ID).NotEmpty().WithMessage("Activity ID is required");
    }
}
