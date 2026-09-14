---
type: l1-file
spec_version: 1
source: src/utils/arrivalEtaLogic.ts
content_sha: 9079dbfb266ace341fdb1e93ee109785ce008506a35f587ae97fa70c5d40aab8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.343Z
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
