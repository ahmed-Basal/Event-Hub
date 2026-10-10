# 🏗️ Architecture Blueprint & Design Specification

> **Project:** DevMeet Egypt  
> **Engineering Level:** Senior Full-Stack Architecture  
> **Target Framework:** .NET 11.0 / ASP.NET Core & React 19 SPA  
> **Last Updated:** October 2026  

---

## 📑 Table of Contents

1. [Executive Summary & Core Tenets](#1-executive-summary--core-tenets)
2. [High-Level Architectural Topology](#2-high-level-architectural-topology)
3. [C4 Architecture Model](#3-c4-architecture-model)
   - [3.1 Level 1: System Context Diagram](#31-level-1-system-context-diagram)
   - [3.2 Level 2: Container Diagram](#32-level-2-container-diagram)
   - [3.3 Level 3: Component Diagram (Backend API Container)](#33-level-3-component-diagram-backend-api-container)
   - [3.4 Level 4: Dynamic Diagram (CQRS Event Creation Flow)](#34-level-4-dynamic-diagram-cqrs-event-creation-flow)
4. [Layer-by-Layer Detailed Breakdown](#4-layer-by-layer-detailed-breakdown)
   - [4.1 Core Layer — Domain & Application](#41-core-layer--domain--application-srccorecorecsproj)
   - [4.2 Infrastructure Layer — Data & Security](#42-infrastructure-layer--data--security-srcinfrastructureinfrastructurecsproj)
   - [4.3 API Layer — Host & Gateway](#43-api-layer--host--gateway-srcapiapicsproj)
   - [4.4 UI Layer — Frontend SPA](#44-ui-layer--frontend-spa-srcui)
   - [4.5 Testing Layer](#45-testing-layer-testcoretests)
5. [Request Processing & Pipeline Flow](#5-request-processing--pipeline-flow)
6. [Authentication & Authorization Lifecycle](#6-authentication--authorization-lifecycle)
7. [Cross-Cutting Concerns](#7-cross-cutting-concerns)
   - [7.1 Validation Pipeline (FluentValidation)](#71-validation-pipeline-fluentvalidation)
   - [7.2 Error Handling & RFC 7807 Problem Details](#72-error-handling--rfc-7807-problem-details)
   - [7.3 Telemetry & Distributed Tracing](#73-telemetry--distributed-tracing)
   - [7.4 Multi-Tier Defense-in-Depth Security](#74-multi-tier-defense-in-depth-security)
8. [Architectural Decision Records (ADRs)](#8-architectural-decision-records-adrs)

---

## 1. Executive Summary & Core Tenets

DevMeet Egypt is built as a modular monolith adhering strictly to the **Clean Architecture** (Onion Architecture) paradigm, complemented by **Domain-Driven Design (DDD)** tactical patterns, **Command Query Responsibility Segregation (CQRS)** via MediatR, and a modern **React 19 Single Page Application**.

### Guiding Architectural Principles

| Principle | Architectural Manifestation |
| :--- | :--- |
| **Dependency Inversion (DIP)** | The Domain and Application layers hold no direct references to outer infrastructure or data stores. Outer layers depend inward on abstractions. |
| **Separation of Concerns (SoC)** | Business rules, domain state transitions, data access, and HTTP concerns live in dedicated assemblies. |
| **CQRS Segregation** | Read operations (Queries) and write operations (Commands) are decoupled into dedicated models and handlers. |
| **Deterministic Result Pattern** | Handlers never throw exceptions for predictable flow control; they return standardized `Response<T>` payloads. |
| **Zero-Friction Dev Experience** | Vite dev server acts as a local reverse proxy, eliminating CORS and self-signed SSL certificate friction in local environments. |

---

## 2. High-Level Architectural Topology

```mermaid
graph TD
    subgraph UILayer ["1. UI Presentation Layer (React 19 SPA) - src/UI"]
        SPA["React 19 + TypeScript + MUI v9"]
        TanStack["TanStack React Query v5 (Server-State Cache)"]
        ViteProxy["Vite Dev Reverse Proxy (/api, /scalar, /health)"]
        SPA --> TanStack --> ViteProxy
    end

    subgraph APILayer ["2. API Host & Presentation Gateway - src/API"]
        Kestrel["Kestrel HTTP / HTTPS Server"]
        SecurityMW["Security Pipeline (HSTS, RateLimiter, OWASP Headers)"]
        ExceptionMW["ExceptionMiddleware (RFC 7807)"]
        Controllers["Controllers (Account, Activities, Home)"]
        ApiConfigs["Modular Extensions (Core, Versioning, Extra)"]
        ScalarDocs["Scalar API Documentation (/scalar/v1)"]
        
        Kestrel --> SecurityMW --> ExceptionMW --> Controllers
        Kestrel --> ScalarDocs
    end

    subgraph CoreLayer ["3. Core Business & Application Layer - src/Core"]
        subgraph DomainSlice ["Domain (Enterprise Core)"]
            Aggregates["Activity (Aggregate Root)"]
            Entities["User, ActivityAttendee, RefreshToken"]
            Common["BaseEntity, SlugHelper, Invariants"]
        end
        subgraph AppSlice ["Application (CQRS & Contracts)"]
            MediatRPipeline["MediatR Pipeline Behaviors"]
            Validation["FluentValidation Behavior"]
            Tracing["Tracing & Metrics Behaviors"]
            Handlers["Command & Query Handlers"]
            Contracts["Abstractions: IAppDbContext, IUserAccessor, ITokenService"]
            Exceptions["AppException (Unified Error Model)"]
        end
        MediatRPipeline --> Validation --> Tracing --> Handlers
        Handlers --> DomainSlice
    end

    subgraph InfraLayer ["4. Infrastructure Layer - src/Infrastructure"]
        subgraph DataSlice ["Data Access (Persistence)"]
            DbContext["DevMeetDbContext : IAppDbContext"]
            EFMigrations["EF Core PostgreSQL Migrations"]
            DbSeed["DbInitializer & Seed Data"]
        end
        subgraph SecSlice ["Security & Identity"]
            JWT["TokenService : ITokenService"]
            UserAccessor["UserAccessor : IUserAccessor"]
            Policies["Authorization Handlers & Policies"]
        end
    end

    Database[("PostgreSQL 17 Database")]

    ViteProxy -->|"HTTPS / Local Proxy"| Kestrel
    Controllers --> MediatRPipeline
    Handlers --> Contracts
    DataSlice -.->|"Implements"| Contracts
    SecSlice -.->|"Implements"| Contracts
    DbContext --> Database
```

---

## 3. C4 Architecture Model

The **C4 Model** (Context, Containers, Components, Dynamic) provides hierarchical architectural views of the system across four levels of abstraction, formatted with standard C4 notation and CSS color conventions.

---

### 3.1 Level 1: System Context Diagram

The System Context diagram establishes the boundary of the DevMeet Egypt platform, illustrating the human actors interacting with the system and external third-party software integrations.

```mermaid
flowchart TB
    classDef person fill:#08427b,stroke:#052e56,color:#ffffff,stroke-width:2px;
    classDef internalSystem fill:#1168bd,stroke:#0b4884,color:#ffffff,stroke-width:2px;
    classDef externalSystem fill:#777777,stroke:#555555,color:#ffffff,stroke-width:2px;
    classDef boundary fill:#f8f9fa,stroke:#444444,stroke-width:2px,stroke-dasharray: 5 5;

    Developer(["👤 Software Developer<br/><b>[Person]</b><br/>Browses, searches, RSVPs, and attends developer meetups across Egypt"]):::person
    Organizer(["👤 Community Organizer<br/><b>[Person]</b><br/>Creates, manages, and schedules technical events and tracks RSVPs"]):::person

    subgraph Boundary ["🏢 DevMeet Egypt Platform Boundary"]
        DevMeet["🏛️ DevMeet Egypt System<br/><b>[Software System]</b><br/>Enables Egyptian tech communities to discover, organize, and manage tech events, venues, and developer profiles"]:::internalSystem
    end

    LocationIQ["🗺️ LocationIQ API<br/><b>[External System]</b><br/>Forward/reverse geocoding and Egyptian map coordinates"]:::externalSystem
    Telemetry["📊 Observability Stack<br/><b>[External System]</b><br/>Seq (Logs), Jaeger (Traces), Prometheus & Grafana (Metrics)"]:::externalSystem

    Developer -->|"Views meetups, registers account, and RSVPs via [HTTPS]"| DevMeet
    Organizer -->|"Creates, edits, and manages tech events via [HTTPS]"| DevMeet
    DevMeet -->|"Fetches venue coordinates & address validation via [REST / HTTPS]"| LocationIQ
    DevMeet -->|"Pushes distributed traces (4317), logs (5341), and metrics (/metrics)"| Telemetry

    class Boundary boundary;
```

---

### 3.2 Level 2: Container Diagram

The Container diagram zooms into the DevMeet Egypt boundary, showing the major deployable software containers, their technologies, and communication protocols.

```mermaid
flowchart TB
    classDef person fill:#08427b,stroke:#052e56,color:#ffffff,stroke-width:2px;
    classDef container fill:#2b78c5,stroke:#1a4d80,color:#ffffff,stroke-width:2px;
    classDef database fill:#1a5276,stroke:#11334d,color:#ffffff,stroke-width:2px;
    classDef externalSystem fill:#777777,stroke:#555555,color:#ffffff,stroke-width:2px;
    classDef boundary fill:#f8f9fa,stroke:#444444,stroke-width:2px,stroke-dasharray: 5 5;

    User(["👤 Developer / Organizer<br/><b>[Person]</b><br/>Accesses platform via desktop or mobile web browser"]):::person

    subgraph Boundary ["🏢 DevMeet Egypt Architecture Boundary"]
        Proxy["🔀 Reverse Proxy / Dev Server<br/><b>[Container: Vite / Nginx]</b><br/>Terminates SSL, serves SPA static bundles, and proxies /api, /scalar, and /health"]:::container
        SPA["💻 Single-Page Application (SPA)<br/><b>[Container: React 19, TypeScript, MUI v9]</b><br/>Provides UI, event discovery, interactive maps, form validation, and TanStack Query cache"]:::container
        API["⚙️ Backend Web API Host<br/><b>[Container: ASP.NET Core, .NET 11]</b><br/>Executes CQRS commands/queries via MediatR, security pipeline, and serves Scalar OpenAPI docs"]:::container
        DB[("🗄️ Relational Database<br/><b>[Container: PostgreSQL 17]</b><br/>Persists users, activities, attendees, refresh tokens, and venue coordinates")]:::database
    end

    LocationIQ["🗺️ LocationIQ API<br/><b>[External System]</b><br/>Address geocoding service"]:::externalSystem
    Seq["📋 Seq Log Server<br/><b>[Container: Docker :8081]</b><br/>Centralized structured log ingestion"]:::externalSystem
    Jaeger["🔍 Jaeger Tracing<br/><b>[Container: Docker :16686]</b><br/>Distributed OpenTelemetry trace spans"]:::externalSystem
    PromGraf["📈 Prometheus & Grafana<br/><b>[Containers: Docker :9090/:3001]</b><br/>Scrapes /metrics and displays dashboards"]:::externalSystem

    User -->|"Navigates to https://localhost:3000 [HTTPS]"| Proxy
    Proxy -->|"Serves static HTML/JS/CSS bundles"| SPA
    Proxy -->|"Proxies /api, /scalar, /health requests"| API
    SPA -->|"Makes REST API requests with JWT Bearer [JSON / HTTPS]"| API
    SPA -->|"Fetches venue autocomplete coordinates [HTTPS]"| LocationIQ
    API -->|"Queries and persists domain entities via EF Core [TCP 5432]"| DB
    API -->|"Streams structured Serilog events [HTTP 5341]"| Seq
    API -->|"Exports activity trace spans via OTLP [gRPC 4317]"| Jaeger
    PromGraf -->|"Scrapes /metrics endpoint every 15s [HTTP]"| API

    class Boundary boundary;
```

---

### 3.3 Level 3: Component Diagram (Backend API Container)

The Component diagram dissects the **Backend Web API Container**, highlighting how Clean Architecture and CQRS slices assemble inside the ASP.NET Core host:

```mermaid
flowchart TB
    classDef client fill:#08427b,stroke:#052e56,color:#ffffff,stroke-width:2px;
    classDef component fill:#2b78c5,stroke:#1a4d80,color:#ffffff,stroke-width:2px;
    classDef database fill:#1a5276,stroke:#11334d,color:#ffffff,stroke-width:2px;
    classDef boundary fill:#f8f9fa,stroke:#444444,stroke-width:2px,stroke-dasharray: 5 5;

    SPA["💻 Single-Page Application<br/><b>[Container: React 19 SPA]</b>"]:::client
    Postgres[("🗄️ PostgreSQL Database<br/><b>[Container: PostgreSQL 17]</b>")]:::database

    subgraph APIContainer ["⚙️ DevMeet Backend API Container"]
        SecMW["🛡️ Security Pipeline<br/><b>[Component: SecurityExtensions]</b><br/>HSTS Preload, 308 HTTPS Redirection, Rate Limiter, OWASP Headers"]:::component
        ErrMW["🚨 Exception Middleware<br/><b>[Component: ExceptionMiddleware]</b><br/>Catches unhandled exceptions & validation errors, emits RFC 7807"]:::component
        Controllers["📡 API Controllers<br/><b>[Component: BaseApiController]</b><br/>ActivitiesController, AccountController, HomeController"]:::component
        ScalarDoc["📖 Scalar Documentation<br/><b>[Component: Scalar.AspNetCore]</b><br/>Interactive OpenAPI UI at /scalar/v1 with Bearer scheme"]:::component
        Pipeline["⚡ MediatR Pipeline<br/><b>[Component: Pipeline Behaviors]</b><br/>ValidationBehavior (FluentValidation), TracingBehavior (OTel)"]:::component
        Handlers["🧩 CQRS Feature Handlers<br/><b>[Component: MediatR Handlers]</b><br/>CreateActivity, GetActivityList, Login, Register, GetCurrentUser"]:::component
        Domain["🏛️ Domain Entities<br/><b>[Component: Domain Aggregate Root]</b><br/>Rich Activity entity, AppUser, invariants, SEO slug generator"]:::component
        TokenSvc["🔑 Token Service<br/><b>[Component: TokenService]</b><br/>Signs and verifies HMAC-SHA512 JWT access & refresh tokens"]:::component
        DbContext["💾 DevMeetDbContext<br/><b>[Component: EF Core / IAppDbContext]</b><br/>Entity configurations, change tracking, and SQL query generation"]:::component
    end

    SPA -->|"1. Sends HTTP REST requests [JSON/HTTPS]"| SecMW
    SecMW -->|"2. Passes through rate limit & security filters"| ErrMW
    ErrMW -->|"3. Routes valid requests to"| Controllers
    Controllers -->|"4. Informs metadata to"| ScalarDoc
    Controllers -->|"5. Dispatches Command / Query via ISender"| Pipeline
    Pipeline -->|"6. Validates payload & forwards to"| Handlers
    Handlers -->|"7. Applies business invariants on"| Domain
    Handlers -->|"8. Requests JWT token generation from"| TokenSvc
    Handlers -->|"9. Queries and persists entities via"| DbContext
    DbContext -->|"10. Executes SQL queries via Npgsql [TCP 5432]"| Postgres

    class APIContainer boundary;
```

---

### 3.4 Level 4: Dynamic Diagram (CQRS Event Creation Flow)

The Dynamic diagram details the runtime collaboration between components during the creation of a new technical event:

```mermaid
sequenceDiagram
    autonumber
    actor Organizer as 👤 Community Organizer
    participant SPA as 💻 React 19 SPA (Hook Form + Zod)
    participant Proxy as 🔀 Vite / Nginx Proxy
    participant SecMW as 🛡️ Security & Rate Limiter MW
    participant API as 📡 ActivitiesController
    participant Pipe as ⚡ ValidationBehavior (FluentValidation)
    participant Handler as 🧩 CreateActivityCommandHandler
    participant Domain as 🏛️ Activity (Aggregate Root)
    participant DB as 💾 DevMeetDbContext (PostgreSQL)

    Organizer->>SPA: 1. Fills form (Title, Venue, Date, Category) & clicks "Publish"
    SPA->>SPA: 2. Validates client-side constraints with Zod schema
    SPA->>Proxy: 3. Dispatches POST /api/activities with Bearer JWT
    Proxy->>SecMW: 4. Forwards to backend Kestrel server
    SecMW->>SecMW: 5. Validates rate limit token bucket & OWASP headers
    SecMW->>API: 6. Routes to ActivitiesController.Create(CreateActivityDto)
    API->>Pipe: 7. Sends CreateActivityCommand via MediatR
    Pipe->>Pipe: 8. Executes CreateActivityValidator rules
    alt Validation Failed (Invalid Input)
        Pipe-->>SPA: 9a. Throws ValidationException ➔ 400 Bad Request (RFC 7807)
        SPA-->>Organizer: 10a. Displays inline field error toasts
    else Validation Succeeded
        Pipe->>Handler: 9b. Passes validated command to Handler
        Handler->>Domain: 10b. Instantiates Activity aggregate (private setters)
        Domain->>Domain: 11b. Validates domain invariants & computes SEO slug
        Handler->>DB: 12b. Adds Activity & commits transaction (SaveChangesAsync)
        DB-->>Handler: 13b. SQL INSERT committed, returns ID
        Handler-->>API: 14b. Returns Response<string>.Success(activityId)
        API-->>SPA: 15b. Returns HTTP 200 OK { statusCode: 200, data: "guid" }
        SPA->>SPA: 16b. Invalidates TanStack Query cache & navigates to event
        SPA-->>Organizer: 17b. Displays success notification & renders event page
    end
```

---

## 4. Layer-by-Layer Detailed Breakdown

### 4.1 Core Layer — Domain & Application (`src/Core/Core.csproj`)

- **Assembly:** `Core.csproj`
- **Namespaces:** `Core.Domain`, `Core.Application`
- **Dependencies:** `MediatR`, `FluentValidation`, `AutoMapper`. (Zero dependencies on EF Core, ASP.NET Core, or Infrastructure).
- **Responsibilities:**
  - **Enterprise Domain:**
    - `Core.Domain.Common.BaseEntity`: Common audit and identity contract (`Id`, `CreatedAt`, `UpdatedAt`, `IsDeleted`).
    - `Activity` Aggregate Root: Rich model encapsulating invariants, state transitions, venue coordinates, and attendees with private setters.
    - Identity & Security Entities: `User` and `RefreshToken`.
    - Pure Helpers: `SlugHelper` generating deterministic URL slugs.
  - **Application CQRS & Orchestration:**
    - Vertical feature slices: `Activities` (Create, Edit, Delete, Details, List), `Account` (Login, Register, Refresh Token), `Home` (Dashboard metrics).
    - Pipeline Behaviors: `ValidationBehavior` (FluentValidation) and `TracingBehavior` (OpenTelemetry).
    - Contracts & Abstractions: `IAppDbContext`, `IUserAccessor`, `ITokenService`.
    - Unified Error Model: `AppException` and standardized `Response<T>` envelopes.

### 4.2 Infrastructure Layer — Data & Security (`src/Infrastructure/Infrastructure.csproj`)

- **Assembly:** `Infrastructure.csproj`
- **Namespaces:** `Infrastructure.Data`, `Infrastructure.Security`
- **Dependencies:** `Core.csproj`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Microsoft.AspNetCore.Authentication.JwtBearer`.
- **Responsibilities:**
  - **Persistence & Data Access (`Infrastructure.Data`):**
    - `DevMeetDbContext`: Implements `IAppDbContext` from Core with Fluent API configurations.
    - Automated Code-First PostgreSQL migrations and Egyptian tech community seed data.
  - **Security & Identity Adapters (`Infrastructure.Security`):**
    - `TokenService`: Issues HMAC-SHA512 JWT access tokens and cryptographically random refresh tokens.
    - `UserAccessor`: Reads authenticated `ClaimsPrincipal` from `IHttpContextAccessor`.
    - Authorization Handlers & Requirements (e.g., `IsHostRequirement`).

### 4.3 API Layer — Host & Gateway (`src/API/API.csproj`)

- **Assembly:** `API.csproj`
- **Namespaces:** `API`, `API.Controllers`, `API.Extensions`, `API.Configuration`, `API.Middleware`
- **Dependencies:** `Core.csproj`, `Infrastructure.csproj`, `Scalar.AspNetCore`, `Serilog.AspNetCore`, `Asp.Versioning.Mvc`.
- **Responsibilities:**
  - **Composition Root:** `Program.cs` orchestrates DI across `ModuleCoreDi`, `InfrastructureServicesRegistration`, and API extensions.
  - **Thin Controllers:** Validate HTTP parameters and route directly to MediatR `ISender`.
  - **Modular Architecture Extensions:**
    - `Core`: General framework and middleware wiring.
    - `Versioning`: URL / Header / Query API versioning with `Asp.Versioning`.
    - `Extra`: Scalar OpenAPI documentation, Serilog, and observability.
  - **RFC 7807 Error Pipeline:** `ExceptionMiddleware` translating exceptions and `AppException` to RFC 7807 problem details.

### 4.4 UI Layer — Frontend SPA (`src/UI/`)

- **Directory:** `src/UI/`
- **Tech Stack:** React 19, TypeScript, Vite, Material UI (MUI v9), TanStack Query v5, React Router.
- **Responsibilities:**
  - **Server-State Management:** TanStack Query handles caching, background invalidation, and optimistic mutations.
  - **Vite Reverse Proxy:** Forwards `/api`, `/scalar`, `/openapi`, and `/health` requests to backend Kestrel (`https://localhost:7223`), eliminating CORS and SSL friction.
  - **Form Validation:** React Hook Form with Zod schemas for instant feedback.

### 4.5 Testing Layer (`test/Core.Tests/`)

- **Assembly:** `Core.Tests.csproj`
- **Tech Stack:** xUnit, FluentAssertions, Moq.
- **Responsibilities:**
  - Unit tests for Domain entities and invariants (`BaseEntityTests`, `SlugHelperTests`).
  - Unit tests for CQRS handlers and validators.
  - Configuration and settings tests (`ApiSettingsTests`, `ApiConfigurationTests`).

---

## 5. Request Processing & Pipeline Flow

Every inbound HTTP request traverses a hardened middleware pipeline before reaching the CQRS handler:

```mermaid
sequenceDiagram
    autonumber
    actor User as Browser / Frontend
    participant Proxy as Vite Reverse Proxy
    participant Kestrel as Kestrel Web Server
    participant Security as Security & Rate Limiter MW
    participant ErrorMW as ExceptionMiddleware
    participant API as ActivitiesController
    participant Pipeline as MediatR Pipeline (Validation & Tracing)
    participant Handler as CreateActivityCommandHandler
    participant DB as PostgreSQL (DevMeetDbContext)

    User->>Proxy: POST /api/activities (Bearer Token + JSON Payload)
    Proxy->>Kestrel: Forward to Backend Host (localhost:7223)
    Kestrel->>Security: Enforce HSTS, OWASP Headers & Rate Limiting
    alt Rate Limit Exceeded
        Security-->>User: 429 Too Many Requests (Retry-After Header)
    else Rate Limit OK
        Security->>ErrorMW: Pass down pipeline
        ErrorMW->>API: Route to Controller Action
        API->>Pipeline: Send(CreateActivityCommand)
        Pipeline->>Pipeline: Validate with FluentValidation
        alt Validation Rules Fail
            Pipeline-->>ErrorMW: Throw ValidationException
            ErrorMW-->>User: 400 Bad Request (RFC 7807 Problem Details)
        else Validation Passes
            Pipeline->>Handler: Handle(Command, CancellationToken)
            Handler->>DB: Add Activity & Commit Transaction
            DB-->>Handler: Transaction Committed
            Handler-->>API: Response<string>.Success(activityId)
            API-->>User: 200 OK { statusCode: 200, succeeded: true, data: "guid" }
        end
    end
```

---

## 6. Authentication & Authorization Lifecycle

DevMeet Egypt implements a stateless JWT authentication architecture combined with secure refresh tokens:

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client (Axios)
    participant AuthAPI as AccountController (/api/account/login)
    participant MediatR as LoginCommandHandler
    participant TokenSvc as TokenService
    participant DB as DevMeetDbContext

    Client->>AuthAPI: POST /api/account/login { email, password }
    AuthAPI->>MediatR: Dispatch LoginCommand
    MediatR->>DB: Verify User Credentials & Password Hash
    alt Invalid Credentials
        MediatR-->>Client: 401 Unauthorized / Bad Request
    else Valid Credentials
        MediatR->>TokenSvc: GenerateAccessToken(User) & GenerateRefreshToken()
        TokenSvc-->>MediatR: JWT Access Token (15 min) + Refresh Token (7 days)
        MediatR->>DB: Persist RefreshToken
        MediatR-->>Client: 200 OK { token, username, displayName, refreshToken }
        Client->>Client: Store in Storage & Configure Axios Auth Header
    end

    Note over Client, AuthAPI: Subsequent API Request
    Client->>AuthAPI: GET /api/account (Header: Authorization Bearer {token})
    AuthAPI->>AuthAPI: Validate Token Signature & Expiry
    AuthAPI-->>Client: 200 OK (User Profile)
```

---

## 7. Cross-Cutting Concerns

### 7.1 Validation Pipeline (FluentValidation)
- Validators are declared next to commands in vertical slices (e.g., `CreateActivityValidator`).
- Executed automatically by `ValidationBehavior<TRequest, TResponse>`.
- Any validation failure throws a `ValidationException` containing property-level error lists, mapped directly to RFC 7807 responses.

### 7.2 Error Handling & RFC 7807 Problem Details
- Unhandled exceptions are intercepted centrally by [`ExceptionMiddleware.cs`](file:///c:/Users/ahmed/OneDrive/Desktop/FullStackDotNEtREACT/API/Middleware/ExceptionMiddleware.cs).
- Standardized error format:
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
      "Title": ["The Title field is required."]
    },
    "traceId": "00-805c882070a7895de57164f2d366c2f7-01"
  }
  ```

### 7.3 Telemetry & Distributed Tracing
- **OpenTelemetry SDK:** Instruments inbound ASP.NET Core requests, Entity Framework Core queries, and outbound HTTP client requests.
- **Exporters:**
  - **Jaeger (OTLP gRPC 4317):** Visual distributed traces for query bottleneck detection.
  - **Prometheus (Scraping `/metrics`):** Request rates, error rates, and duration histograms.
  - **Seq (OTLP HTTP 5341):** Structured centralized logging with Trace ID correlation.

### 7.4 Multi-Tier Defense-in-Depth Security
- **Strict HSTS:** `max-age=31536000; includeSubDomains; preload`.
- **Permanent HTTPS Redirection:** Upgrades insecure requests to HTTPS (308 Permanent Redirect).
- **Rate Limiting:**
  - Global Sliding Window: 100 req/min per IP.
  - Auth Fixed Window: 10 req/min for `/login` and `/register`.
- **OWASP Hardening Headers:** `nosniff`, `DENY`, `strict-origin-when-cross-origin`, `X-XSS-Protection`.

---

## 8. Architectural Decision Records (ADRs)

### ADR-001: 4-Layer Clean Architecture & CQRS Segregation

- **Context:** The application manages complex business invariants, diverse query shapes, and multiple integration points across backend and frontend.
- **Decision:** Adopt an enterprise 4-layer Clean Architecture organized under `src/` and `test/`:
  1. `src/Core`: Domain logic & Application CQRS (Domain + Application).
  2. `src/Infrastructure`: Persistence (EF Core, Migrations) & Security (JWT, Identity).
  3. `src/API`: Presentation host, modular configurations (Core, Versioning, Extra), and middlewares.
  4. `src/UI`: Modern React 19 SPA with Vite reverse proxy.
  5. `test/Core.Tests`: Automated unit and integration test suite.
- **Consequences:** Eliminates unnecessary project fragmentation while enforcing strict inward dependency boundaries, high cohesion, zero circular dependencies, and streamlined CI/CD pipeline builds.

### ADR-002: Scalar API Reference over Swagger UI
- **Context:** .NET 9+ deprecates out-of-the-box Swashbuckle in favor of built-in `Microsoft.AspNetCore.OpenApi`.
- **Decision:** Implement **Scalar.AspNetCore** for OpenAPI v1 visualization.
- **Consequences:** Modern, fast, dark-themed UI with integrated JWT Bearer authentication, request generation in multiple languages (C#, cURL, JS), and zero external Swagger dependencies.

### ADR-003: Vite Reverse Proxy for Development
- **Context:** Developers frequently encountered `ERR_CERT_AUTHORITY_INVALID` and CORS issues when calling `https://localhost:7223` from `localhost:3000`.
- **Decision:** Configure Vite's dev server `proxy` in `vite.config.ts` to forward `/api`, `/scalar`, and `/health` with `secure: false`.
- **Consequences:** Transparent same-origin requests from the browser, zero CORS configuration needed in local development, and seamless transition to production Nginx reverse proxy.

### ADR-004: Standardized `Response<T>` Envelope
- **Context:** Inconsistent API payloads between direct models and error objects complicate frontend state handling.
- **Decision:** Enforce `Response<T>` envelope wrapping status code, success boolean, data payload, and error messages.
- **Consequences:** Uniform client-side unwrapping, guaranteed structure across all endpoints, and cleaner diagnostic handling.
