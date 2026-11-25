# 💻 DevMeet Egypt — Frontend UI Layer (`src/UI`)

> **Technology Stack:** React 19.2, TypeScript 5.9, Vite 8.3, Material UI (MUI v9), TanStack Query v5, Leaflet Maps, React Hook Form, Zod.

---

## 📑 Overview

The **UI Layer** is a high-performance Single Page Application (SPA) providing Egyptian developer communities with intuitive event discovery, interactive map geocoding, attendee management, and authentication flows. It communicates seamlessly with the **ASP.NET Core API** via a built-in reverse proxy in Vite.

---

## 🏗️ Architecture & Folder Structure

```text
src/UI/src/
├── app/                  # Application bootstrap, routing & providers (Theme, QueryClient)
├── features/             # Vertical feature slices
│   ├── activities/       # Activity listing, details, CRUD form, schemas & hooks
│   ├── account/          # Authentication, login, register, profile state
│   └── home/             # Landing hero, countdown timer, upcoming events
├── shared/               # Shared cross-cutting components & utilities
│   ├── api/              # Axios instance, agent interceptors, LocationIQ client
│   ├── components/       # Maps (Leaflet), feedback (Spinner, EmptyState), form controls
│   ├── types/            # Shared TypeScript contracts
│   └── utils/            # Date formatting, slug helpers, validation helpers
└── theme/                # Custom Material UI theme tokens and styling
```

---

## 🚀 Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
- App URL: **`https://localhost:3000`**
- All API calls (`/api/*`), Scalar documentation (`/scalar/*`), and health endpoints (`/health`) are transparently proxied to Kestrel at `https://localhost:7223` with zero CORS/SSL friction.

### 3. Production Build
```bash
npm run build
```

---

## 🔌 Key Technical Highlights

1. **Vite Reverse Proxy (`vite.config.ts`):** Eliminates browser CORS and self-signed development SSL certificate mismatches.
2. **Server State Caching (`@tanstack/react-query`):** In-memory query caching, automatic revalidation, and optimistic updates.
3. **Form Validation (`react-hook-form` + `zod`):** Fast, declarative validation aligned with backend CQRS command rules.
4. **Interactive Maps (`leaflet` + `react-leaflet`):** Egyptian map venue pinning with LocationIQ geocoding integration.
