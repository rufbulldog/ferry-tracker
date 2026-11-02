---
type: l1-file
spec_version: 1
source: src/utils/constants.ts
content_sha: f9b38fc95883b8690d1a293238974a07c4c553b6cdf01d4288e2c570982b89fd
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.478Z
---

# constants.ts

**Path:** `src/utils/constants.ts`
**Lines:** 75
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `crossingMinutesForRoute` | function | `(route: Route): number` |
| `TERMINALS` | const | `{ SEATTLE: 7, // Colman Dock BAINBRIDGE: 3, // Bainbridge Island KINGSTON: 12, …` |
| `TERMINAL_CAMERAS` | const | `Record<number, { name: string; url: string }[]>` |
| `FERRY_CROSSING_MINUTES` | const | `35` |
| `FERRY_TO_HOME_FALLBACK_MINUTES` | const | `15` |
| `HISTORY_MIN_SAMPLES` | const | `3` |
| `Route` | type |  |
| `CROSSING_MINUTES_BY_ROUTE` | const | `Record<Route, number>` |
| `ROUTES` | const | `Record<Route, { from: number; to: number; label: string }>` |
