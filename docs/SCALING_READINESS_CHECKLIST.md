# Scaling Readiness Checklist (No Behavior Change)

This checklist is a practical execution plan to improve capacity and stability without changing user-facing functionality.

Scope:
- Frontend BFF: `frontend/app`
- Backend API: `backend/app`
- Infra: Vercel + Heroku

Current implementation status (code-side):
- Implemented: session heartbeat load controls (guest interval + jitter), BFF route rate limiting (`/api/session`, `/api/graphql`, `/api/backend`), cache-policy split, and structured proxy completion logs.
- Remaining: infrastructure sizing/tuning, backend data-layer scale work, and formal progressive load-test gates.

---

## 0) Success Criteria (set first)

Target service levels (example):
- API/BFF p95 latency: `< 400ms`
- API/BFF 5xx rate: `< 0.5%`
- Session endpoint p95: `< 200ms`
- Cache hit ratio (read routes): `> 80%`

Define these before changing anything so each phase has clear pass/fail gates.

---

## 1) Frontend/BFF Implementation Checklist

### 1.1 Session Traffic Guardrails

Files:
- `frontend/app/src/_services/auth/SessionSync.tsx`
- `frontend/app/src/app/api/session/route.ts`

Changes:
- Add interval jitter for heartbeat requests.
- Add guest backoff (avoid frequent checks for clearly unauthenticated sessions).
- Keep route timeout and fast null fallback in `/api/session`.
- Keep payload minimal (`authenticated`, `user` summary only).

Validation:
- `npm run typecheck`
- `npm run lint`
- Observe terminal/dev logs: session checks should be less bursty.

---

### 1.2 BFF Cache Policy Matrix (Read-Only Routes)

Files:
- `frontend/app/src/app/api/graphql/route.ts`
- `frontend/app/src/app/api/backend/[...path]/route.ts`

Changes:
- Introduce explicit cache policy by route/query class:
  - Public read: `public, s-maxage=30, stale-while-revalidate=120`
  - Auth/personalized: `no-store`
- Keep existing security headers.
- Keep 503 graceful fallback behavior.

Validation:
- `npm run test:smoke`
- `npm run test:e2e`
- Use browser devtools/network to verify returned cache headers.

---

### 1.3 Lightweight Request Coalescing (Hot Paths)

Files:
- `frontend/app/src/app/api/graphql/route.ts`
- `frontend/app/src/app/api/backend/[...path]/route.ts`

Changes:
- Add short-lived in-flight map for identical public read requests per instance.
- Same key waits on same promise instead of duplicate upstream fetches.
- Apply only to safe idempotent reads.

Validation:
- Local scripted parallel fetches should produce fewer upstream calls.
- Confirm response parity with existing behavior.

---

### 1.4 Structured Performance Logs for Proxy Routes

Files:
- `frontend/app/src/_utilities/observability/logger.ts`
- `frontend/app/src/app/api/graphql/route.ts`
- `frontend/app/src/app/api/backend/[...path]/route.ts`
- `frontend/app/src/app/api/session/route.ts`

Changes:
- Log structured fields on completion:
  - `route`, `method`, `status`, `latency_ms`, `request_id`, `upstream_target`
- Keep sensitive value redaction.

Validation:
- Trigger sample requests and verify consistent log fields.
- Confirm no secrets in logs.

---

### 1.5 Edge Rate Limits (BFF)

Files:
- `frontend/app/src/proxy.ts` (if implementing middleware gate)
- or route handlers directly under `src/app/api/**/route.ts`

Changes:
- Add route-specific throttles:
  - strict on `/api/session`
  - moderate on `/api/graphql`
  - strict on auth routes forwarded via `/api/backend`
- Return `429` with retry hint headers.

Validation:
- Local/load test bursts should trigger predictable 429s.
- Normal traffic unaffected.

---

## 2) Backend Implementation Checklist (Heroku)

### 2.1 Database Scale Basics

Files (typical):
- Django settings and DB config files
- ORM query modules for article/profile/auth hot paths

Changes:
- Add/verify indexes for top read filters/sorts.
- Introduce read replica strategy for read-heavy traffic.
- Enable connection pooling (PgBouncer).

Validation:
- Query plan checks for hot endpoints.
- DB CPU/connection dashboards under load.

---

### 2.2 GraphQL Resolver Cost Controls

Files:
- GraphQL schema/resolvers and data access layer

Changes:
- Add dataloader/batching for N+1 prevention.
- Add query depth/complexity limits.
- Add resolver-level timeouts where possible.

Validation:
- Load tests on article detail/list queries.
- Compare resolver count and DB query count before/after.

---

### 2.3 Auth Refresh Storm Protection

Files:
- Auth/token refresh endpoints and services

Changes:
- Rate-limit refresh attempts per session/user.
- Add exponential backoff/jitter hints.
- Prevent duplicate concurrent refreshes per principal where feasible.

Validation:
- Simulate mass token expiry; verify no self-DOS pattern.

---

### 2.4 Redis Strategy

Files:
- Cache config + read service modules
- Celery/queue config modules

Changes:
- Cache hot read responses with short TTLs + targeted invalidation.
- Separate cache vs queue key spaces.
- Verify SSL/TLS settings and cert requirements in prod.

Validation:
- Cache hit ratio and miss latency in dashboard.
- Queue backlog health under burst.

---

## 3) Environment Variables to Add/Review

Frontend (`Vercel`):
- `INTERNAL_APP_ORIGIN` (optional explicit internal origin)
- `NEXT_INTERNAL_APP_ORIGIN` (optional fallback)
- `NEXT_PUBLIC_OBSERVABILITY_DEBUG` (dev only)
- Route-level rate-limit settings (if added)

Backend (`Heroku`):
- DB pool settings
- Redis URL + SSL/cert config
- Rate-limit thresholds
- APM/observability DSN and sampling rates

Keep secrets out of source control.

---

## 4) Load Testing Plan (Progressive)

Phase gates:
1. 10k concurrent (30-minute soak)
2. 50k concurrent
3. 100k concurrent
4. 250k burst tests
5. 1M event simulation (ramp model, not instant all-heavy)

At each gate, enforce:
- p95/p99 latency SLOs
- 5xx error budget
- DB connection headroom
- cache hit ratio target
- no runaway retries

Recommended tools:
- k6 / Locust / Artillery

---

## 5) Execution Order (Recommended)

1. Session traffic controls (`SessionSync` + `/api/session`)
2. BFF cache policy matrix
3. Structured proxy logs + request IDs
4. Route-level rate limiting
5. Backend query/index + resolver batching
6. Progressive load tests with pass/fail gates

---

## 6) Validation Commands (Frontend)

Run from `frontend/app`:

```bash
npm run lint
npm run typecheck
npm run test:smoke
npm run test:e2e
```

Optional full pipeline:

```bash
npm run ci
```

---

## 7) Definition of Done

Mark complete only when:
- Each phase gate passes in load test reports.
- Alerts and dashboards are live and actionable.
- Incident runbook is tested in at least one game-day drill.
- No user-facing behavior regression is observed.

