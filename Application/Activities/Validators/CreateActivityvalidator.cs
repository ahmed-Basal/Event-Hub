using Application.Activities.DTO;
using FluentValidation;

namespace Application.Activities.Validators;

public class CreateActivityvalidator : BaseActivityValidator<CreateActivityDto, CreateActivityDto>
{
    public CreateActivityvalidator() : base(x => x)
    {
    }
}