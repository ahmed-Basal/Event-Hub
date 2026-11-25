namespace DevMeet.Shared.Common;

/// <summary>
/// Deterministic identifiers shared across module seeders and Keycloak realm export
/// so every module seeds independently without cross-module database references.
/// </summary>
public static class SeedConstants
{
    public static class Users
    {
        public const string AdminId = "11111111-1111-1111-1111-111111111111";
        public const string SaraId = "22222222-2222-2222-2222-222222222222";
        public const string OmarId = "33333333-3333-3333-3333-333333333333";
        public const string BobId = "44444444-4444-4444-4444-444444444444";
    }

    public static class Activities
    {
        public const string DotNetCairoId = "act-dotnet-cairo";
        public const string ReactAlexId = "act-react-alex";
        public const string AiWorkshopId = "act-ai-workshop";
        public const string CloudSummitId = "act-cloud-summit";
        public const string SecurityMeetupId = "act-security-meetup";
        public const string UpcomingReminderId = "act-upcoming-24h";
    }
}
