---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: bb06b06bf6b28fc17d49aaa68777d90e6eecab0b15d4d16a4ed7159549510b31
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.502Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 98
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useArrivalEta` | function | `(ferryRoute: Route): ArrivalEtaResult` |
| `usePlannedArrival` | function | `(ferryRoute: Route, plannedDeparture: Date \| null): ArrivalEta \| null` |
| `ArrivalEta` | interface |  |
| `ArrivalKind` | type |  |
| `ArrivalEtaResult` | interface |  |

### Documented exports

- **`usePlannedArrival`** — Arrival for the sailing the leave-by plan targets (not the boat currently

## Imports

**Internal:**
- `../store/checkIn` (`getCheckIn`, `subscribeCheckIn`)
- `../utils/arrivalEtaLogic` (`selectActiveDeparture`, `etaDepartureBasis`)
- `../utils/arrivalPlan` (`ARRIVAL_CONFIG`, `ArrivalEta`, `computeArrival`)
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/time` (`parseDate`)
- `./useDailyTrends` (`useRecentTrends`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`, `useSyncExternalStore`)
