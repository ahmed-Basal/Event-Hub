using System.Diagnostics;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.Interfaces;
using Application.Observability;
using Domain;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Email;

public class EmailService(
    IOptions<ResendSettings> options,
    IHttpClientFactory httpClientFactory,
    ILogger<EmailService> logger) : IEmailService
{
    private readonly ResendSettings _settings = options.Value;

    public Task SendEmailConfirmationAsync(User user, string confirmationLink, CancellationToken ct = default)
    {
        var subject = "Confirm your DevMeet email address";
        var html = $"""
            <div style="font-family:Inter,sans-serif;background:#0A0E1A;color:#FFFFFF;padding:32px;border-radius:16px;">
                <h2 style="color:#6366F1;">Welcome to DevMeet, {user.DisplayName ?? user.UserName}!</h2>
                <p style="color:#94A3B8;">Click the button below to confirm your email address:</p>
                <a href="{confirmationLink}" style="display:inline-block;padding:12px 24px;background:#6366F1;color:#FFFFFF;text-decoration:none;border-radius:9999px;font-weight:600;">
                    Confirm Email
                </a>
            </div>
            """;

        return SendAsync(user.Email!, subject, html, confirmationLink, ct);
    }

    public Task SendPasswordResetAsync(User user, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset your DevMeet password";
        var html = $"""
            <div style="font-family:Inter,sans-serif;background:#0A0E1A;color:#FFFFFF;padding:32px;border-radius:16px;">
                <h2 style="color:#EC4899;">Password Reset Request</h2>
                <p style="color:#94A3B8;">Click the button below to set a new password:</p>
                <a href="{resetLink}" style="display:inline-block;padding:12px 24px;background:#EC4899;color:#FFFFFF;text-decoration:none;border-radius:9999px;font-weight:600;">
                    Reset Password
                </a>
            </div>
            """;

        return SendAsync(user.Email!, subject, html, resetLink, ct);
    }

    private async Task SendAsync(string to, string subject, string html, string actionLink, CancellationToken ct)
    {
        using var activity = DevMeetTelemetry.ActivitySource.StartActivity("Resend: SendEmail", ActivityKind.Client);
        activity?.SetTag("dependency.name", "resend");
        activity?.SetTag("email.mode", string.IsNullOrWhiteSpace(_settings.ApiKey) ? "dev_noop" : "resend");

        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            logger.LogDebug("[DEV EMAIL] Subject: {Subject} (Resend API key not configured; delivery skipped)", subject);
            activity?.SetStatus(ActivityStatusCode.Ok);
            return;
        }

        var sw = Stopwatch.StartNew();
        var outcome = "success";
        try
        {
            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

            var response = await client.PostAsJsonAsync(
                "https://api.resend.com/emails",
                new { from = _settings.FromEmail, to = new[] { to }, subject, html },
                ct);

            if (!response.IsSuccessStatusCode)
            {
                outcome = "failure";
                var body = await response.Content.ReadAsStringAsync(ct);
                logger.LogError("Resend email delivery failed ({Status}): {Body}", response.StatusCode, body);
                activity?.SetStatus(ActivityStatusCode.Error, $"HTTP {(int)response.StatusCode}");
            }
            else
            {
                activity?.SetStatus(ActivityStatusCode.Ok);
            }
        }
        catch (Exception ex)
        {
            outcome = "failure";
            DevMeetTelemetry.RecordException(activity, ex);
            throw;
        }
        finally
        {
            sw.Stop();
            var tags = new TagList
            {
                { "dependency", "resend" },
                { "operation", "send_email" },
                { "outcome", outcome }
            };
            DevMeetTelemetry.DependencyCallsTotal.Add(1, tags);
            DevMeetTelemetry.DependencyDurationMs.Record(sw.Elapsed.TotalMilliseconds, tags);
        }
    }
}
