using Hangfire;
using Identity.Module.Infrastructure;

namespace Identity.Module.Jobs;

[Queue("critical")]
[AutomaticRetry(Attempts = 3)]
public sealed class SendEmailJob(IEmailService emailService)
{
    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
        => emailService.SendAsync(toEmail, subject, htmlBody, ct);
}
