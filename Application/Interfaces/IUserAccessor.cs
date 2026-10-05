namespace Application.Interfaces;

public interface IUserAccessor
{
    string? GetEmail();
    string? GetUsername();
}
