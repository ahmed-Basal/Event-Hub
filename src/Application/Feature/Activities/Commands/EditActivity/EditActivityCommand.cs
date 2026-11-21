using System.Text.Json.Serialization;
using Core.Application.Bases;
using Core.Application.Feature.Activities.Commands.Base;
using MediatR;

namespace Core.Application.Feature.Activities.Commands.EditActivity;

public record EditActivityCommand : BaseActivityCommand, IRequest<Response<Unit>>
{
    [JsonIgnore]
    public string ID { get; set; } = string.Empty;
}
