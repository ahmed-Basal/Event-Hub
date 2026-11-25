# DevMeet Egypt (Event-Hub) — Architecture Blueprint

> **Architecture Style:** Project-Isolated Modular Monolith + Vertical Slice Architecture (CQRS Folders)  
> **Backend:** .NET 11 / ASP.NET Core / FastEndpoints / EF Core / PostgreSQL 17 / Hangfire / OutputCache  
> **Frontend:** Next.js 15 (App Router) / React 19 / TypeScript / MUI / TanStack Query (Standalone Workspace)  
> **Identity:** Keycloak 26.1 (OIDC Authorization Code + PKCE via Next.js BFF + TOTP/OTP)

---

## 1. Repository & Project Topology

```text
├── frontend/                              # Standalone Next.js 15 App (zero backend imports)
│   ├── Dockerfile
│   └── src/
│       ├── app/                           # App Router + BFF /api/auth/* routes
│       ├── core/                          # API client, BFF session, Zustand store
│       ├── layout/                        # NavBar, Footer, Providers
│       └── modules/                       # Feature slices (activities, admin, comments, followers, home, identity, notifications, payments, profiles)
└── backend/                               # Standalone .NET 11 Modular Monolith
    ├── DevMeet.slnx
    ├── Dockerfile
    ├── src/
    │   ├── Shared/DevMeet.Shared/         # AppRoles, ApiResponse<T>, SeedConstants, DomainEvents, IBackgroundJobScheduler, IRecurringJobRegistrar, IModuleSeeder
    │   ├── Modules/
    │   │   ├── Identity/
    │   │   │   ├── Identity.Contracts/    # UserSummary, ICurrentUser, IIdentityDirectory, IEmailDispatcher
    │   │   │   └── Identity.Module/       # Keycloak-only JWT (+ SignalR token), Rich AppUser + JIT sync, SendEmailJob, IdentitySeeder
    │   │   ├── Activities/
    │   │   │   ├── Activities.Contracts/  # ActivitySummary, UserActivityItem, IActivitiesDirectory (+ GetByIdsAsync)
    │   │   │   └── Activities.Module/     # Capacity & Waitlist + auto-promotion, OutputCache ("PublicEvents"), SendUpcomingActivityRemindersJob, ActivitiesSeeder
    │   │   ├── Payments/
    │   │   │   ├── Payments.Contracts/    # PaymentStatusNames, OrderSummaryDto, IPaymentsDirectory
    │   │   │   └── Payments.Module/       # Stripe Checkout + Webhooks + Ticket QR CheckInCode + CheckIn endpoint, ExpireStalePendingOrdersJob, CleanupPaymentRecordsJob
    │   │   ├── Profiles/
    │   │   │   ├── Profiles.Contracts/    # FollowStats, IProfilesDirectory
    │   │   │   └── Profiles.Module/       # Profiles, Followings, Cloudinary Photos, ProfilesSeeder
    │   │   ├── Notifications/
    │   │   │   ├── Notifications.Contracts/ # NotificationType, INotificationPublisher
    │   │   │   └── Notifications.Module/  # DB persistence + SSE Broker (30s tickets + 25s ping heartbeat), CleanupOldNotificationsJob
    │   │   ├── Comments/
    │   │   │   └── Comments.Module/       # SignalR CommentHub + CommentCreatedEventHandler + CommentsSeeder
    │   │   └── Diagnostics/
    │   │       └── Diagnostics.Module/    # Development-only diagnostics endpoints
    │   └── Host/DevMeet.API/              # Composition Root, Hangfire, OutputCache, Security, Observability, Module Seed Runner
    └── tests/
        ├── Architecture.Tests/            # Compile-time module isolation, Hangfire jobs, and seeder enforcement
        ├── Core.Tests/                    # Rich domain models, Waitlist, Ticket CheckIn, SSE, KeycloakClaims, HangfireOptions
        └── Integration.Tests/             # PostgreSQL integration tests
```

---

## 2. Module Isolation Rules

- Every `*.Module` project references only `DevMeet.Shared`, its own `*.Contracts`, and other modules' `*.Contracts` — **never** another module's `*.Module`.
- Inside each module, `Features/` is organized by CQRS intent: `Commands/`, `Queries/`, and `Events/`.
- All domain entities use private constructors, encapsulated collections, and domain methods enforcing invariants.

---

## 3. Hangfire Background Jobs (PostgreSQL Storage)

- **Storage & Dashboard:** Hangfire persists jobs in PostgreSQL (`hangfire` schema) with dashboard at `/hangfire` (open in Development, restricted to `Admin` in Production).
- **Queues:** `critical` → `default` → `maintenance`.
- **Active Jobs:**
  1. `SendEmailJob` (`critical`, fire-and-forget, 3 retries): Ticket confirmation emails with `CheckInCode` & waitlist promotion emails via Resend.
  2. `ExpireStalePendingOrdersJob` (`default`, `*/15 * * * *`): Expires `Pending` ticket orders older than 30 minutes.
  3. `SendUpcomingActivityRemindersJob` (`default`, `0 * * * *`): Sends idempotent (`ReminderSentAtUtc == null`) 24-hour reminders to attendees.
  4. `CleanupPaymentRecordsJob` (`maintenance`, `0 */6 * * *`): Removes expired `IdempotencyRecords` and `ProcessedWebhookEvents` > 90 days.
  5. `CleanupOldNotificationsJob` (`maintenance`, `0 4 * * *`): Removes read `Notifications` > 60 days.
