using Application.Activities.DTO;
using AutoMapper;
using Domain;
using Domain.Common;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<CreateActivityDto, Activity>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugHelper.GenerateSlug(src.Title)));

        CreateMap<EditActivityDto, Activity>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugHelper.GenerateSlug(src.Title)));
    }
}
