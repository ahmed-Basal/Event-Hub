using Application.Feature.Activities.DTO;
using Application.Mapping.Common;
using AutoMapper;
using Domain;

namespace Application.Mapping.Activities;

/// <summary>
/// AutoMapper profile configuration for Activity aggregates, DTOs, and projections.
/// </summary>
public class ActivityMappingProfile : Profile
{
    public ActivityMappingProfile()
    {
        // CreateActivityDto -> Activity
        CreateMap<CreateActivityDto, Activity>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => MappingDefaults.ResolveSlug(src.Title)))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => MappingDefaults.ResolveCategory(src.Category)))
            .ForMember(dest => dest.Image, opt => opt.MapFrom(src => MappingDefaults.ResolveCategoryImage(src.Image, src.Category, null)))
            .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => MappingDefaults.ResolveCoordinate(src.Latitude, MappingDefaults.DefaultLatitude)))
            .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => MappingDefaults.ResolveCoordinate(src.Longitude, MappingDefaults.DefaultLongitude)));

        // EditActivityDto -> Activity (partial updates with null/whitespace/zero guards)
        CreateMap<EditActivityDto, Activity>()
            .ForMember(dest => dest.ID, opt => opt.Ignore())
            .ForMember(dest => dest.Slug, opt =>
            {
                opt.Condition(src => !string.IsNullOrWhiteSpace(src.Title));
                opt.MapFrom(src => MappingDefaults.ResolveSlug(src.Title));
            })
            .ForMember(dest => dest.Image, opt => opt.MapFrom((src, dest) =>
                MappingDefaults.ResolveCategoryImage(src.Image, src.Category, dest.Image)))
            .ForAllMembers(opt =>
            {
                opt.Condition((src, dest, srcMember) =>
                {
                    if (srcMember is null) return false;
                    if (srcMember is string str && string.IsNullOrWhiteSpace(str)) return false;
                    if (srcMember is double d && d == 0) return false;
                    return true;
                });
            });

        // Entity <-> DTO Projections
        CreateMap<Activity, ActivityDto>()
            .ForMember(dest => dest.HostUsername, opt => opt.MapFrom(src =>
                src.Attendees.FirstOrDefault(x => x.IsHost)!.User.UserName))
            .ForMember(dest => dest.HostDisplayName, opt => opt.MapFrom(src =>
                src.Attendees.FirstOrDefault(x => x.IsHost)!.User.DisplayName))
            .ForMember(dest => dest.Attendees, opt => opt.MapFrom(src => src.Attendees));

        CreateMap<ActivityAttendee, AttendeeDto>()
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.User.DisplayName))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => src.User.Bio))
            .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.User.Picture))
            .ForMember(dest => dest.IsHost, opt => opt.MapFrom(src => src.IsHost));

        CreateMap<ActivityDto, Activity>()
            .ForMember(dest => dest.Attendees, opt => opt.Ignore());

        CreateMap<Activity, EditActivityDto>();
        CreateMap<Activity, CreateActivityDto>();
    }
}
