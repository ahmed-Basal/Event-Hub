using Application.Feature.Activities.DTO;
using Application.Feature.Activities.command.Models;

namespace Application.Feature.Activities.command.Validation;

public class CreateActivityValidator : BaseActivityValidator<CreateActivityCommand, CreateActivityDto>
{
    public CreateActivityValidator() : base(x => x.ActivityDto)
    {
    }
}
