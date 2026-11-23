namespace Infrastructure.Payments;

public sealed class StripeSettings
{
    public const string SectionName = "StripeSettings";
    public string PublishableKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
}
