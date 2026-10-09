# 🏛️ DevMeet Egypt — Full-Stack Platform

[![.NET 11](https://img.shields.io/badge/.NET-11.0%20(Preview)-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Scalar API](https://img.shields.io/badge/Scalar-API%20Reference-059669?style=for-the-badge&logo=openapiinitiative&logoColor=white)](https://scalar.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker Compose](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **DevMeet Egypt** is an enterprise-grade full-stack platform for discovering, organizing, and managing developer conferences, workshops, and tech meetups across Egypt. Built with **ASP.NET Core (Clean Architecture + CQRS + DDD)** and a modern **React 19 SPA (Vite + TypeScript + TanStack Query + MUI)**.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [API Documentation & Versioning (Scalar)](#-api-documentation--versioning-scalar)
- [Core Engineering Highlights](#-core-engineering-highlights)
- [Security & Rate Limiting](#-security--rate-limiting)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Quick Start Guide](#-quick-start-guide)
- [Project Structure](#-project-structure)
- [Observability & Monitoring](#-observability--monitoring)
- [License](#-license)

---

## 🏛 System Architecture

> 📘 **For in-depth architectural specifications, complete C4 Model diagrams (Context, Container, Component, Dynamic), sequence flows, and ADRs, see the comprehensive [ARCHITECTURE.md](file:///c:/Users/ahmed/OneDrive/Desktop/FullStackDotNEtREACT/ARCHITECTURE.md) blueprint.**

The solution adheres strictly to **Clean Architecture** (Onion Architecture) principles and the **CQRS (Command Query Responsibility Segregation)** pattern:

```text
┌──────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  React 19 SPA (Vite + TS + MUI v9) ──(Reverse Proxy)──┐       │
└───────────────────────────────────────────────────────│──────┘
                                                        ▼
┌──────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  Controllers, Security Middlewares, Scalar / OpenAPI v1      │
└───────────────────────────────┬──────────────────────────────┘
                                │ Calls MediatR
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  Commands, Queries, FluentValidation, MediatR Behaviors      │
│  Abstractions: IAppDbContext, IUserAccessor, ITokenService   │
└───────────────────┬──────────────────────┬───────────────────┘
                    │                      │
       Implements   │                      │ Implements
                    ▼                      ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      Persistence Layer       │ │    Infrastructure Layer     │
│  DevMeetDbContext (EF Core)  │ │  JWT TokenService, UserAcc  │
│  PostgreSQL Migrations & Seed│ │  Security Options           │
└──────────────┬───────────────┘ └─────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                        Domain Layer                          │
│  Activity Aggregate Root (DDD Rich Model, Slug Invariants)   │
│  AppUser, ActivityAttendee (Zero External Dependencies)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📖 API Documentation & Versioning (Scalar)

The API is fully documented and interactively testable using **[Scalar.AspNetCore](https://github.com/scalar/scalar)**, providing modern, dark-themed, and responsive interactive documentation with integrated **JWT Bearer Authentication**.

### Interactive Documentation URLs

| Documentation | Environment | URL |
| :--- | :--- | :--- |
| **Scalar API Reference** | Backend Direct | **[https://localhost:7223/scalar/v1](https://localhost:7223/scalar/v1)** |
| **Scalar API Reference** | Frontend Proxy | **[https://localhost:3000/scalar/v1](https://localhost:3000/scalar/v1)** |
| **Raw OpenAPI v1 Spec** | Backend Direct | **[https://localhost:7223/openapi/v1.json](https://localhost:7223/openapi/v1.json)** |
| **Auto-Redirects** | Root & Swagger | `https://localhost:7223/` & `/swagger` ➔ `/scalar/v1` |

### API Versioning & OpenAPI v1

- **Spec Version:** OpenAPI 3.1 (`v1`)
- **Document Title:** `DevMeet Egypt API`
- **Security Scheme:** `HTTP Bearer` (JWT Authentication)
- **Interactive Auth:** Click **"Authorize"** in Scalar and paste your JWT token to test protected endpoints (`/api/account`, `POST /api/activities`).

---

## 💡 Core Engineering Highlights

| Component | Architecture & Design Patterns |
| :--- | :--- |
| **Clean Architecture** | Strict dependency inversion; domain layer contains zero third-party packages or database references. |
| **CQRS with MediatR** | Segregated query handlers (read-only) and command handlers (state mutations) with cross-cutting pipeline behaviors. |
| **Domain-Driven Design (DDD)** | Rich domain entities with private setters, business mutation methods (`CancelActivity()`, `ReactivateActivity()`), and automated SEO slug generation. |
| **Standardized Result Envelope** | Handlers return `Response<T>` wrapping `statusCode`, `succeeded`, `data`, and `errors`, guaranteeing consistent payloads across the wire. |
| **Pipeline Validation** | Automated pre-handler execution with **FluentValidation** via `ValidationBehavior<TRequest, TResponse>`. |
| **Vite Dev Server Proxy** | Built-in reverse proxy in `vite.config.ts` forwarding `/api`, `/scalar`, and `/health` requests directly to Kestrel, eliminating SSL self-signed certificate mismatches and CORS issues in local development. |
| **Server State Management** | **TanStack React Query v5** handling caching, background polling, stale-while-revalidate, and optimistic UI mutations. |

---

## 🔒 Security & Rate Limiting

The API implements a multi-tier **Defense-in-Depth** security strategy ([`API/Extensions/SecurityExtensions.cs`](file:///c:/Users/ahmed/OneDrive/Desktop/FullStackDotNEtREACT/API/Extensions/SecurityExtensions.cs)):

1. **HTTP Strict Transport Security (HSTS):** Preload-ready HSTS (`max-age=31536000; includeSubDomains; preload`).
2. **Permanent HTTPS Redirection:** Insecure HTTP requests (port `5096`) are upgraded permanently (HTTP 308) to HTTPS (port `7223`).
3. **Multi-Tier Rate Limiting (`Microsoft.AspNetCore.RateLimiting`):**
   - **Global Limiter:** Sliding Window of **100 req/min per IP** (6 segments of 10s) to prevent burst attacks.
   - **Authentication Limiter:** Fixed Window of **10 req/min** on `/api/account/login` and `/api/account/register` to neutralize brute-force attacks.
   - **RFC 7807 & 6585:** Exceeded limits return `429 Too Many Requests` with a `Retry-After` header.
4. **OWASP Hardening Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`.

---

## 📡 API Endpoints Reference

### 1. Authentication & Account (`/api/account`)
> 🛡️ *Protected by Fixed Window Rate Limiter (Max 10 req/min)*

| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/login` | Authenticate with email & password, returns JWT token | Public |
| `POST` | `/api/account/register` | Register a new user account | Public |
| `GET` | `/api/account` | Retrieve current authenticated user profile | `Bearer {token}` |
| `POST` | `/api/account/refresh-token` | Exchange refresh token for fresh access token | Public |
| `POST` | `/api/account/logout` | Revoke active refresh token | `Bearer {token}` |

### 2. Activities & Meetups (`/api/activities`)
> 🛡️ *Protected by Sliding Window Limiter (Max 100 req/min per IP)*

| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | List all activities (with optional category & status filtering) | Public |
| `GET` | `/api/activities/{id}` | Retrieve single activity details by ID or slug | Public |
| `POST` | `/api/activities` | Create a new tech event | `Bearer {token}` |
| `PUT` | `/api/activities/{id}` | Update existing event details | `Bearer {token}` |
| `DELETE`| `/api/activities/{id}` | Delete an event | `Bearer {token}` |

### 3. Home & Metrics (`/api/home`)

| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/home` | Retrieves featured activity, upcoming events, and community stats | Public |

### 4. Health & Diagnostics

| Method | Endpoint | Description | Target |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | ASP.NET Core liveness health check | Orchestrators / Load Balancers |
| `GET` | `/metrics` | Prometheus metrics scraping endpoint | Prometheus Scraper |
| `GET` | `/scalar/v1` | Scalar interactive API documentation | Developers / QA |

---

## 🚀 Quick Start Guide

### Prerequisites
- **.NET SDK 11.0 / 10.0** ([Download](https://dotnet.microsoft.com/download))
- **Node.js 20.x+ & npm** ([Download](https://nodejs.org/))
- **PostgreSQL 16+** (Running locally on port `5432` with database `reactivities`)

---

### Step 1: Run the Backend API

```bash
# 1. Trust ASP.NET Core developer HTTPS certificate
dotnet dev-certs https --trust

# 2. Run the API (applies EF Core migrations & seeds initial meetups automatically)
dotnet run --project API/API.csproj
```
- API Base: `https://localhost:7223` (or `http://localhost:5096`)
- Interactive Scalar Docs: **`https://localhost:7223/scalar/v1`**

---

### Step 2: Run the React Frontend

In a separate terminal:

```bash
# 1. Navigate to client
cd client

# 2. Install dependencies
npm install

# 3. Start Vite dev server with proxy enabled
npm run dev
```
- Frontend Application: **`https://localhost:3000`**
- All `/api/*` and `/scalar/*` requests are proxied seamlessly to the backend with zero CORS/SSL friction.

---

### Step 3: Run Full Containerized Stack (Docker Compose)

To spin up PostgreSQL, Seq, Jaeger, Prometheus, Grafana, API, and the Client simultaneously:

```bash
docker compose up -d --build
```

---

## 📂 Project Structure

```text
DevMeet-Egypt/
├── API/                              # ASP.NET Core Web API Host
│   ├── Controllers/                  # Thin controllers dispatching to MediatR
│   ├── Extensions/                   # OpenApi, Security, CORS, Observability
│   │   ├── OpenApiExtensions.cs      # Scalar API Reference & Bearer scheme
│   │   ├── SecurityExtensions.cs     # HSTS, Rate Limiting, OWASP headers
│   │   └── CorsExtensions.cs         # Config-driven CORS rules
│   ├── Middleware/                   # Centralized ExceptionMiddleware (RFC 7807)
│   ├── Program.cs                    # Application composition root
│   └── appsettings.json              # App configuration
│
├── Application/                      # Business Logic & CQRS (Clean Architecture)
│   ├── Feature/                      # Vertical feature slices (Activities, Account, Home)
│   ├── Behaviors/                    # ValidationBehavior, TracingBehavior
│   ├── Interfaces/                   # Abstractions (IAppDbContext, IUserAccessor)
│   └── Bases/                        # Response<T> envelope & Result models
│
├── Domain/                           # Core Domain (Zero Dependencies)
│   ├── Activity.cs                   # Rich Activity Aggregate Root
│   ├── User.cs                       # Identity User model
│   └── ActivityAttendee.cs           # Many-to-many relationship entity
│
├── Persistence/                      # EF Core & Database Context
│   ├── DevMeetDbContext.cs           # Database context implementing IAppDbContext
│   ├── DbInitializer.cs              # Automatic database migration & seeding
│   └── Migrations/                   # EF Core Code-First migrations
│
├── Infrastructure/                   # External Services (JWT, User Accessor)
│   └── Security/                     # TokenService & Claims extraction
│
└── client/                           # React 19 Frontend SPA (Vite + TypeScript)
    ├── public/
    │   └── config.json               # Zero-rebuild runtime config
    ├── src/
    │   ├── features/                 # Activities, Account, Home feature modules
    │   ├── shared/                   # Axios agent, form inputs, Zod schemas
    │   ├── theme/                    # Material UI dark/light theme tokens
    │   └── main.tsx                  # Application entry point
    └── vite.config.ts                # Vite config + Proxy to backend + mkcert
```

---

## 🔭 Observability & Monitoring

When running with the telemetry stack:
- **Jaeger Distributed Tracing:** `http://localhost:16686` (Inspect end-to-end trace spans for HTTP, EF Core, and MediatR)
- **Seq Structured Logging:** `http://localhost:8081` (Real-time structured event logs)
- **Prometheus Metrics:** `http://localhost:9090` (Scrapes `/metrics` every 15s)
- **Grafana Dashboards:** `http://localhost:3001` (`admin` / `admin`)

---

## 📄 License

This project is licensed under the **MIT License**. Free for educational, community, and commercial use.