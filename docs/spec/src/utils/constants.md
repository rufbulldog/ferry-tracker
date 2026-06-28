---
type: l1-file
spec_version: 1
source: src/utils/constants.ts
content_sha: 3155245d4f0fc1c0a0c724e49c7d70ede0a37b09c61e071b690e0cdba21119db
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-28T18:29:47.367Z
---

# constants.ts

**Path:** `src/utils/constants.ts`
**Lines:** 49
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `TERMINALS` | const | `{ SEATTLE: 7, // Colman Dock BAINBRIDGE: 3, // Bainbridge Island KINGSTON: 12, …` |
| `TERMINAL_CAMERAS` | const | `Record<number, { name: string; url: string }[]>` |
| `FERRY_CROSSING_MINUTES` | const | `35` |
| `FERRY_TO_HOME_FALLBACK_MINUTES` | const | `15` |
| `Route` | type |  |
| `ROUTES` | const | `Record<Route, { from: number; to: number; label: string }>` |
