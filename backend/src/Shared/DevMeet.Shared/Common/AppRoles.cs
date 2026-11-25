namespace DevMeet.Shared.Common;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Organizer = "Organizer";
    public const string Moderator = "Moderator";
    public const string User = "User";

    public static readonly string[] All = [Admin, Organizer, Moderator, User];
}
