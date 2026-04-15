# Testing and continuous integration

This document is a **focused runbook** for automated testing and CI. For architecture and quality assessment, see [**FRONTEND_ENGINEERING_GUIDE.md**](./FRONTEND_ENGINEERING_GUIDE.md).

---

## Where to run commands

All `npm` commands below are run from:

```text
frontend/app
```

Install once:

```bash
npm install
```

---

## What runs in CI

The GitHub Actions workflow **`.github/workflows/frontend-ci.yml`** executes, in order:

1. **`npm run lint`** — ESLint (Next, TypeScript, jsx-a11y), zero warnings allowed.
2. **`npm run typecheck`** — `tsc --noEmit`.
3. **`npm run test`** — **Smoke tests** (Node) **then** **Vitest** with **coverage thresholds**.
4. **`npm run build`** — Production Next.js build.
5. **`npm run test:e2e`** — Playwright against a **production server** on port **3002** (`CI=true` in CI).

Locally, the same sequence is:

```bash
npm run ci
```

---

## Test layers (what they protect)

| Layer | Command | Technology | Purpose |
|-------|---------|------------|---------|
| **Smoke** | `npm run test:smoke` | Node + `scripts/run-tests.mjs` | Fast checks: URL helpers, `HttpClient` with mocked `fetch`, auth helpers, signup validation wiring. |
| **Unit / module** | `npm run test:unit` | Vitest + happy-dom + v8 coverage | Deeper tests in `src/**/*.test.ts(x)`; **fails** if coverage on allowlisted files drops below thresholds in `vitest.config.ts`. |
| **Combined** | `npm run test` | Smoke **+** Vitest | What CI runs before build. |
| **E2E** | `npm run test:e2e` | Playwright | Real browser: home, auth tabs, article routes (see `e2e/*.spec.ts`). |

---

## Coverage (Vitest)

Coverage gates apply only to **included files** (see `frontend/app/vitest.config.ts`), for example:

- `src/_network/config/endpoints.ts`
- `src/_network/core/HttpClient.ts`
- `src/_services/auth/auth.helpers.ts`
- `src/_services/auth/signup/signupValidation.ts`

Thresholds (lines, branches, functions, statements) are defined in that config file. **Change the config if you intentionally add files to the allowlist.**

---

## Typical local workflows

**During development (fast feedback):**

```bash
npm run lint
npm run typecheck
```

**Before opening a PR:**

```bash
npm run validate
```

**Full release check (matches automation intent):**

```bash
npm run ci
```

**E2E only (after `npm run build`, or when CI starts the server):**

```bash
npm run test:e2e
```

On Windows PowerShell, set CI for deterministic Playwright:

```powershell
$env:CI='1'; npm run test:e2e
```

---

## Troubleshooting

| Symptom | Likely cause | Suggestion |
|---------|----------------|------------|
| Port 3002 in use | Previous `next start` or Playwright | Stop the process or set `CI=true` so Playwright does not reuse a stale server. |
| Vitest coverage failure | New code in allowlisted files without tests | Add tests or adjust coverage config with team agreement. |
| E2E passes locally, fails in CI | Flaky timing or missing `CI=true` | Use traces (`playwright.config.ts`: `trace: on-first-retry`) and retry settings in CI. |

---

## See also

- [**FRONTEND_ENGINEERING_GUIDE.md** §13–§15](./FRONTEND_ENGINEERING_GUIDE.md#13-testing-strategy) — Full narrative and enterprise-grade assessment.
