using Domain;

namespace Application.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(User user, string confirmationLink, CancellationToken ct = default);
    Task SendPasswordResetAsync(User user, string resetLink, CancellationToken ct = default);
}
