using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace Application.Observability;

/// <summary>
/// Centralized OpenTelemetry ActivitySource and Meter for Event-Hub.
/// All metric labels are strictly low-cardinality (never UserId, Email, OrderId, or ActivityId).
/// </summary>
public static class DevMeetTelemetry
{
    public const string ServiceVersion = "1.0.0";
    public const string ActivitySourceName = "DevMeet.Application";
    public const string MeterName = "DevMeet.Application";

    public static readonly ActivitySource ActivitySource = new(ActivitySourceName, ServiceVersion);
    public static readonly Meter Meter = new(MeterName, ServiceVersion);

    // ── MediatR Application Metrics ──────────────────────────────────────────
    public static readonly Counter<long> MediatRRequestsTotal =
        Meter.CreateCounter<long>(
            "mediatr_requests_total",
            description: "Total number of MediatR requests processed");

    public static readonly Histogram<double> MediatRRequestDurationMs =
        Meter.CreateHistogram<double>(
            "mediatr_request_duration_ms",
            unit: "ms",
            description: "Duration of MediatR request processing in milliseconds");

    // ── Business Metrics ─────────────────────────────────────────────────────
    public static readonly Counter<long> ActivitiesCreatedTotal =
        Meter.CreateCounter<long>(
            "devmeet_activities_created_total",
            description: "Total number of activities created");

    public static readonly Counter<long> ActivitiesCancelledTotal =
        Meter.CreateCounter<long>(
            "devmeet_activities_cancelled_total",
            description: "Total number of activities cancelled");

    public static readonly Counter<long> TicketOrdersCreatedTotal =
        Meter.CreateCounter<long>(
            "devmeet_ticket_orders_created_total",
            description: "Total number of ticket orders created");

    public static readonly Counter<long> PaymentsTotal =
        Meter.CreateCounter<long>(
            "devmeet_payments_total",
            description: "Total number of payment outcomes (paid, failed, refunded)");

    public static readonly Counter<long> NotificationsDeliveredTotal =
        Meter.CreateCounter<long>(
            "devmeet_notifications_delivered_total",
            description: "Total number of notification delivery attempts");

    // ── Outbox & Background Worker Metrics ───────────────────────────────────
    private static long _outboxPendingMessages;

    public static readonly ObservableGauge<long> OutboxPendingMessages =
        Meter.CreateObservableGauge(
            "devmeet_outbox_pending_messages",
            () => Interlocked.Read(ref _outboxPendingMessages),
            description: "Current number of pending outbox messages observed by the worker");

    public static void SetOutboxPendingCount(long count)
        => Interlocked.Exchange(ref _outboxPendingMessages, count < 0 ? 0 : count);

    public static readonly Counter<long> OutboxProcessedTotal =
        Meter.CreateCounter<long>(
            "devmeet_outbox_processed_total",
            description: "Total number of outbox messages handled (processed, retry, failed)");

    public static readonly Histogram<double> OutboxBatchDurationMs =
        Meter.CreateHistogram<double>(
            "devmeet_outbox_batch_duration_ms",
            unit: "ms",
            description: "Duration of OutboxProcessor batch execution in milliseconds");

    // ── External Dependency Metrics ──────────────────────────────────────────
    public static readonly Counter<long> DependencyCallsTotal =
        Meter.CreateCounter<long>(
            "devmeet_dependency_calls_total",
            description: "Total number of external dependency operations (stripe, resend, cloudinary)");

    public static readonly Histogram<double> DependencyDurationMs =
        Meter.CreateHistogram<double>(
            "devmeet_dependency_duration_ms",
            unit: "ms",
            description: "Duration of external dependency operations in milliseconds");

    public static void RecordException(Activity? activity, Exception ex)
    {
        if (activity is null) return;

        activity.SetStatus(ActivityStatusCode.Error, ex.Message);
        activity.AddEvent(new ActivityEvent("exception", tags: new ActivityTagsCollection
        {
            { "exception.type", ex.GetType().FullName ?? ex.GetType().Name },
            { "exception.message", ex.Message },
            { "exception.stacktrace", ex.ToString() }
        }));
    }
}
