using Activities.Module.Domain;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using FluentValidation;
using Identity.Contracts;
using Microsoft.AspNetCore.OutputCaching;

namespace Activities.Module.Features.Commands;

public sealed class CreateActivityRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public DateTimeOffset Date { get; init; }
    public string City { get; init; } = string.Empty;
    public string Venue { get; init; } = string.Empty;
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public string? Image { get; init; }
    public string Level { get; init; } = "All Levels";
    public List<string>? Tags { get; init; }
    public decimal Price { get; init; }
    public string Currency { get; init; } = "usd";
    public int? MaxCapacity { get; init; }
}

public sealed class CreateActivityValidator : Validator<CreateActivityRequest>
{
    public CreateActivityValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Venue).NotEmpty();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxCapacity).GreaterThan(0).When(x => x.MaxCapacity.HasValue);
    }
}

public sealed class CreateActivityEndpoint(
    ActivitiesDbContext db,
    ICurrentUser currentUser,
    IOutputCacheStore outputCache)
    : Endpoint<CreateActivityRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Post("/api/activities");
        Roles(AppRoles.Admin, AppRoles.Organizer);
    }

    public override async Task HandleAsync(CreateActivityRequest req, CancellationToken ct)
    {
        var activity = Activity.Create(
            req.Title,
            req.Description,
            req.Category,
            req.Date,
            req.City,
            req.Venue,
            req.Latitude,
            req.Longitude,
            req.Image,
            req.Level,
            req.Tags,
            price: req.Price,
            currency: req.Currency,
            maxCapacity: req.MaxCapacity);

        activity.AddAttendee(currentUser.UserId, isHost: true);

        db.Activities.Add(activity);
        await db.SaveChangesAsync(ct);
        await outputCache.EvictByTagAsync("activities", ct);

        await Send.OkAsync(ApiResponse<string>.Ok(activity.Id), ct);
    }
}
