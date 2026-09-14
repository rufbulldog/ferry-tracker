---
type: l1-file
spec_version: 1
source: src/utils/planEstimate.ts
content_sha: c8f28089718d9d30aa47337a5883b596ec4eccabcf9040a8c222cc80c8cbe9b3
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.345Z
---

# planEstimate.ts

**Path:** `src/utils/planEstimate.ts`
**Lines:** 101
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computePlanEstimate` | function | `(params: { sailing: Date; route: Route; vehicle: Vehicle; transitRecords: TransitRecord[] \| undefined; trends: DepartureSnapshot[] \| undefined; }): PlanEstimate` |
| `PlanEstimate` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`, `TransitRecord`, `DepartureSnapshot`)
- `./constants` (`Route`, `HISTORY_MIN_SAMPLES`)
- `./transitConfig` (`TRAVEL_TIMES`, `TRANSIT_ROUTE_MAP`)
- `./transitStats` (`computeTypicalTransitSeconds`)
- `./typicalConditions` (`computeTypicalForSlot`)
