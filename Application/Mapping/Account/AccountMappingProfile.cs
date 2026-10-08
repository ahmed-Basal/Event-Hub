using Application.Feature.Account.DTO;
using Application.Mapping.Common;
using AutoMapper;
using Domain;

namespace Application.Mapping.Account;

/// <summary>
/// AutoMapper profile configuration for User, Account, and Identity DTOs.
/// </summary>
public class AccountMappingProfile : Profile
{
    public AccountMappingProfile()
    {
        // User -> UserDto
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName ?? src.UserName ?? string.Empty))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName ?? string.Empty))
            .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Picture))
            .ForMember(dest => dest.Token, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshToken, opt => opt.Ignore());

        // RegisterDto -> User
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName.Trim()))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email.Trim()))
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Username.Trim()))
            .ForMember(dest => dest.Picture, opt => opt.MapFrom(_ => MappingDefaults.DefaultUserImage));
    }
}
