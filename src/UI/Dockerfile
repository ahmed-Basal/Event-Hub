# ── Stage 1: Dependencies ──────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app/src/UI
COPY src/UI/package.json ./
RUN npm install --legacy-peer-deps

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/src/UI/node_modules ./src/UI/node_modules
COPY src/Features ./src/Features
COPY src/UI ./src/UI
WORKDIR /app/src/UI
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Standalone Production Runner ──────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/src/UI/public ./src/UI/public
COPY --from=builder /app/src/UI/.next/standalone ./
COPY --from=builder /app/src/UI/.next/static ./src/UI/.next/static

EXPOSE 3000
CMD ["node", "src/UI/server.js"]
