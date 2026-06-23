---
type: l1-file
spec_version: 1
source: src/utils/arrivalEtaLogic.ts
content_sha: 87156c2661f1dd80d5585cbcf63a17e116aff9450bfdfaea37f368ee0f33aba8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.720Z
---

# arrivalEtaLogic.ts

**Path:** `src/utils/arrivalEtaLogic.ts`
**Lines:** 92
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `selectActiveDeparture` | function | `(departures: T[] \| undefined): T \| null` |
| `projectedDockTime` | function | `(d: T): Date \| null` |
| `etaDepartureBasis` | function | `(d: T): Date` |
| `DepartureLike` | interface |  |
| `MIN_TURNAROUND_MINUTES` | const | `5` |

### Documented exports

- **`selectActiveDeparture`** — The sailing the ETA is for. Normally the next sailing you'd board — the one
- **`projectedDockTime`** — Projected time the assigned vessel reaches the departure dock.
- **`etaDepartureBasis`** — The departure time the ETA is built from. Defaults to the planned

## Imports

**Internal:**
- `./constants` (`FERRY_CROSSING_MINUTES`)
- `./time` (`addMinutes`, `parseDate`)
