---
type: l1-file
spec_version: 1
source: src/utils/arrivalEtaLogic.ts
content_sha: 6eca66f3c401cb7e345569065a8b86e957bbc525a51bc1050084c1b287b0d4d0
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.650Z
---

# arrivalEtaLogic.ts

**Path:** `src/utils/arrivalEtaLogic.ts`
**Lines:** 106
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `selectActiveDeparture` | function | `(departures: T[] \| undefined): T \| null` |
| `projectedDockTime` | function | `(d: T): Date \| null` |
| `etaDepartureBasis` | function | `(d: T, nowMs: number = Date.now()): Date` |
| `DepartureLike` | interface |  |
| `MIN_TURNAROUND_MINUTES` | const | `5` |

### Documented exports

- **`selectActiveDeparture`** — The sailing the ETA is for. Normally the next sailing you'd board — the one
- **`projectedDockTime`** — Projected time the assigned vessel reaches the departure dock.
- **`etaDepartureBasis`** — The departure time the ETA is built from, kept deliberately *conservative*

## Imports

**Internal:**
- `./constants` (`FERRY_CROSSING_MINUTES`)
- `./time` (`addMinutes`, `parseDate`)
