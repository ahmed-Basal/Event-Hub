using Core.Application.Feature.Activities.DTO;
using FluentValidation;

namespace Core.Application.Feature.Activities.command.Validation;

public class BaseActivityValidator<T, TDto> : AbstractValidator<T> where TDto : BaseActivityDto
{
    public BaseActivityValidator(Func<T, TDto> selector)
    {
        RuleFor(x => selector(x).Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(70).WithMessage("Title cannot exceed 70 characters");

        RuleFor(x => selector(x).Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");

        RuleFor(x => selector(x).Category)
            .NotEmpty().WithMessage("Category is required")
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters");

        RuleFor(x => selector(x).City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(50).WithMessage("City cannot exceed 50 characters");

        RuleFor(x => selector(x).Venue)
            .NotEmpty().WithMessage("Venue is required")
            .MaximumLength(50).WithMessage("Venue cannot exceed 50 characters");

        RuleFor(x => selector(x).Date)
            .NotEmpty().WithMessage("Date is required");

        RuleFor(x => selector(x).Latitude)
            .NotEmpty().WithMessage("Latitude is required")
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => selector(x).Longitude)
            .NotEmpty().WithMessage("Longitude is required")
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180");
    }
}
