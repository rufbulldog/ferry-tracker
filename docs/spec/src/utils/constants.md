---
type: l1-file
spec_version: 1
source: src/utils/constants.ts
content_sha: 6c8f35315f22c6c2abe36af185d07acc0ad235ef23a4cce3deaf1b7c0c8d9201
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.720Z
---

# constants.ts

**Path:** `src/utils/constants.ts`
**Lines:** 50
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `TERMINALS` | const | `{ SEATTLE: 7, // Colman Dock BAINBRIDGE: 3, // Bainbridge Island KINGSTON: 12, …` |
| `TERMINAL_CAMERAS` | const | `Record<number, { name: string; url: string }[]>` |
| `ETA_CONTACT_NUMBER` | const | `'REDACTED'` |
| `FERRY_CROSSING_MINUTES` | const | `35` |
| `FERRY_TO_HOME_FALLBACK_MINUTES` | const | `15` |
| `Route` | type |  |
| `ROUTES` | const | `Record<Route, { from: number; to: number; label: string }>` |
