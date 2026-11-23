using System.Text.Json.Serialization;
using Application.Bases;
using Application.Feature.Activities.Commands.Base;
using MediatR;

namespace Application.Feature.Activities.Commands.EditActivity;

public record EditActivityCommand : BaseActivityCommand, IRequest<Response<Unit>>
{
    [JsonIgnore]
    public string ID { get; set; } = string.Empty;
}
