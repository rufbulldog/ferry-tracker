---
type: l1-file
spec_version: 1
source: src/utils/planEstimate.ts
content_sha: 329a598d8244da5f3d7e90389f38ec5d8e0bbf9cfec42d8b210b88c4a095fbd2
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.721Z
---

# planEstimate.ts

**Path:** `src/utils/planEstimate.ts`
**Lines:** 91
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computePlanEstimate` | function | `(params: { sailing: Date; route: Route; vehicle: Vehicle; transitRecords: TransitRecord[] \| undefined; trends: DepartureSnapshot[] \| undefined; }): PlanEstimate` |
| `PlanEstimate` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`, `TransitRecord`, `DepartureSnapshot`)
- `./constants` (`Route`)
- `./transitConfig` (`TRAVEL_TIMES`, `TRANSIT_ROUTE_MAP`)
- `./transitStats` (`computeTypicalTransitSeconds`)
- `./typicalConditions` (`computeTypicalForSlot`)
