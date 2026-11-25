using System.Net;
using Activities.Module.Infrastructure;
using DevMeet.Shared.Common;
using FastEndpoints;
using FluentValidation;
using Identity.Contracts;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace Activities.Module.Features.Commands;

public sealed class EditActivityRequest
{
    public string Id { get; init; } = string.Empty;
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

public sealed class EditActivityValidator : Validator<EditActivityRequest>
{
    public EditActivityValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Venue).NotEmpty();
        RuleFor(x => x.MaxCapacity).GreaterThan(0).When(x => x.MaxCapacity.HasValue);
    }
}

public sealed class EditActivityEndpoint(
    ActivitiesDbContext db,
    ICurrentUser currentUser,
    IOutputCacheStore outputCache)
    : Endpoint<EditActivityRequest, ApiResponse<string>>
{
    public override void Configure()
    {
        Put("/api/activities/{id}");
        Policies(IsHostRequirement.PolicyName);
    }

    public override async Task HandleAsync(EditActivityRequest req, CancellationToken ct)
    {
        var activity = await db.Activities.Include(a => a.Attendees)
            .FirstOrDefaultAsync(a => a.Id == req.Id || a.Slug == req.Id, ct);

        if (activity is null)
        {
            await Send.ResponseAsync(ApiResponse<string>.Fail(HttpStatusCode.NotFound, "Activity not found."), 404, ct);
            return;
        }

        activity.UpdateDetails(req.Title, req.Description, req.Category, req.Date, req.Level, req.Image, req.Tags, currentUser.UserId);
        activity.UpdateLocation(req.City, req.Venue, req.Latitude, req.Longitude);
        activity.UpdatePricing(req.Price, req.Currency);
        activity.UpdateCapacity(req.MaxCapacity);

        await db.SaveChangesAsync(ct);
        await outputCache.EvictByTagAsync("activities", ct);

        await Send.OkAsync(ApiResponse<string>.Ok(activity.Id), ct);
    }
}
