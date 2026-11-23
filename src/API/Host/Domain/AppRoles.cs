namespace Domain.Common;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Organizer = "Organizer";
    public const string Member = "Member";

    public static readonly string[] All = [Admin, Organizer, Member];
}
