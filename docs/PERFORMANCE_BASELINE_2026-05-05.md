# Performance Baseline - May 5, 2026

Scope: production endpoint sampling for `https://www.bigchiefnewz.com`

## Summary

This run establishes a measurable baseline for page and API latency.  
Because no equivalent older benchmark dataset was recorded in docs with the same method, an exact "faster by X%" from the very first day cannot be computed yet.

What we can now do: rerun this exact method later and calculate true deltas.

## Method

- Environment: remote production sampling from CLI
- Sample size: 20 measured requests per target (plus warmups)
- Metric: end-to-end request duration (ms), reported as min / p50 / p95 / max / avg
- Interval: short sleep between requests to reduce burst artifacts

## Results (captured `2026-05-05T07:26:12.393Z`)

| Target | Status profile | Min (ms) | p50 (ms) | p95 (ms) | Max (ms) | Avg (ms) |
|---|---|---:|---:|---:|---:|---:|
| `/` | 200 x20 | 76.7 | 87.8 | 157.4 | 282.9 | 102.5 |
| `/auth` | 200 x20 | 72.6 | 84.7 | 91.8 | 92.3 | 84.5 |
| `/articles/tea` | 200 x20 | 127.6 | 141.0 | 182.3 | 638.1 | 171.4 |
| `/api/graphql` (`{ __typename }`) | 200 x20 | 59.4 | 66.4 | 104.4 | 235.3 | 80.5 |
| `/api/backend/authorized/me/` (unauth) | 401 x20 | 87.4 | 95.7 | 107.7 | 117.2 | 97.2 |

## Interpretation

- Public and auth pages are currently sub-100ms p50 from this sampling vantage point.
- Category page is slower (expected due to content/data work) but still healthy at p50 ~141ms.
- GraphQL proxy p50 is strong (~66ms) with occasional higher tails.
- Unauthenticated auth-check path remains stable and consistently returns expected `401`.

## How to compute real speed-up next

1. Re-run the same benchmark command against the same targets and similar traffic conditions.
2. Compare `p50`, `p95`, and `avg` against this baseline.
3. Report deltas as:
   - `% improvement = (old - new) / old * 100`

Using this baseline, your next run can produce an exact statement like:
"home p50 improved by X%, graphql p95 improved by Y%."
