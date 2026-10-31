---
type: l1-file
spec_version: 1
source: src/utils/arrivalPlan.ts
content_sha: c274eb5ab506d329fa8928f894231e36646d5a9e662502656abe61403fd76b46
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.585Z
---

# arrivalPlan.ts

**Path:** `src/utils/arrivalPlan.ts`
**Lines:** 115
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computeArrival` | function | `(params: { route: Route; departureTime: Date; liveEta?: Date \| null; transitRecords: TransitRecord[] \| undefined; trends: DepartureSnapshot[] \| undefined; }): ArrivalEta \| null` |
| `ArrivalKind` | type |  |
| `ArrivalEta` | interface |  |
| `ARRIVAL_CONFIG` | const | `Partial<Record<Route, {
  kind: ArrivalKind;
  label: string;
  transitRoute: TransitRoute;
  vehicle: Vehicle;
  fallbackMinutes: number;
}>>` |

### Documented exports

- **`computeArrival`** — Arrival for a sailing leaving at `departureTime`. `liveEta` is the vessel's

## Imports

**Internal:**
- `../types/storage` (`TransitRecord`, `TransitRoute`, `Vehicle`, `DepartureSnapshot`)
- `./constants` (`Route`, `FERRY_TO_HOME_FALLBACK_MINUTES`, `HISTORY_MIN_SAMPLES`, `crossingMinutesForRoute`)
- `./time` (`addMinutes`)
- `./transitStats` (`computeTypicalTransitSeconds`, `TypicalMethod`)
- `./typicalCrossing` (`typicalCrossingMinutes`)
