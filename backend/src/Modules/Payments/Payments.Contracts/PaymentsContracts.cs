namespace Payments.Contracts;

public static class PaymentStatusNames
{
    public const string Pending = "Pending";
    public const string Paid = "Paid";
    public const string Failed = "Failed";
    public const string Refunded = "Refunded";
}

public sealed record OrderSummaryDto(
    string Id,
    string ActivityId,
    string UserId,
    decimal Amount,
    string Currency,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PaidAt);

public interface IPaymentsDirectory
{
    Task<IReadOnlyList<OrderSummaryDto>> GetAllOrderSummariesAsync(CancellationToken ct = default);
}
