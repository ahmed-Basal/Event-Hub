using Core.Application.Feature.Activities.DTO;
using Core.Application.Feature.Activities.command.Models;

namespace Core.Application.Feature.Activities.command.Validation;

public class CreateActivityValidator : BaseActivityValidator<CreateActivityCommand, CreateActivityDto>
{
    public CreateActivityValidator() : base(x => x.ActivityDto)
    {
    }
}
