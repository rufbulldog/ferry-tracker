---
type: l1-file
spec_version: 1
source: src/utils/arrivalPlan.ts
content_sha: 731105bf964031eebb61e577bbbcb70af6a4d815cf5eb9756c226a21a0e4b15a
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-03T07:59:21.942Z
---

# arrivalPlan.ts

**Path:** `src/utils/arrivalPlan.ts`
**Lines:** 119
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computeArrival` | function | `(params: { route: Route; departureTime: Date; liveEta?: Date \| null; transitRecords: TransitRecord[] \| undefined; trends: DepartureSnapshot[] \| undefined; /** Far-side mode; defaults to the route's (bike). */ vehicle?: Vehicle; }): ArrivalEta \| null` |
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
