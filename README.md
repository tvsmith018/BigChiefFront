# Big Chief Ent — Frontend documentation

This folder contains **engineering documentation** for the Next.js frontend (`frontend/app`). It is written for **junior to mid-level** developers and anyone onboarding to the codebase or reviewing it for production readiness.

## Documents

| Document | Purpose |
|----------|---------|
| [**FRONTEND_ENGINEERING_GUIDE.md**](./FRONTEND_ENGINEERING_GUIDE.md) | **Start here.** End-to-end description of the frontend: stack, folder structure, auth and data flow, security notes, testing, CI, and an enterprise-style quality assessment by category. |
| [**TESTING_AND_CI.md**](./TESTING_AND_CI.md) | Focused **runbook**: what each test layer does, exact commands, CI order, troubleshooting. Links back to the main guide for deeper context. |
| [**SCALING_READINESS_CHECKLIST.md**](./SCALING_READINESS_CHECKLIST.md) | Practical no-behavior-change scaling plan: file-by-file implementation checklist, env vars, load-test gates, and validation sequence for Vercel + Heroku deployments. |

## Quick commands (run from `frontend/app`)

```bash
npm install
npm run dev              # local development (Turbopack)
npm run dev:webpack      # local development (Webpack fallback, stability mode)
npm run validate         # lint + TypeScript + all automated tests (no build)
npm run ci               # full pipeline: validate + production build + E2E
```

## Stability lock-in (pre-merge)

Run this minimum checklist before merging to protected branches:

```bash
npm run lint
npm run typecheck
npm run test:e2e
```

If dev-only instability appears (network or HMR churn), use `npm run dev:webpack` to verify whether Turbopack is part of the issue.

## Repository layout reminder

```
frontend/
├── doc/                 # This documentation (you are here)
└── app/                 # Next.js application (npm package root)
    ├── e2e/             # Playwright end-to-end tests
    ├── scripts/         # Node smoke test runner (run-tests.mjs)
    ├── src/             # Application source (`src/app` = routes)
    └── package.json
```

For the full narrative, open [**FRONTEND_ENGINEERING_GUIDE.md**](./FRONTEND_ENGINEERING_GUIDE.md).
