using Application.Activities.DTO;

namespace Application.Activities.Validators;

public class EditActivityValidator : BaseActivityValidator<EditActivityDto, EditActivityDto>
{
    public EditActivityValidator() : base(x => x)
    {
    }
}
