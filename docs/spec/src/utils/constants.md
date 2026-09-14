---
type: l1-file
spec_version: 1
source: src/utils/constants.ts
content_sha: 3b9d25a6ae4ed42b485dbe18b5b0301fd1c3a747b97202c0df9a025b5f150b52
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.344Z
---

# constants.ts

**Path:** `src/utils/constants.ts`
**Lines:** 67
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
