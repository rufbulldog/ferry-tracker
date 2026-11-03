---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: 6ad60ac140eef01621753465b01939eb2eee166b7756a4f4fe2eb0524e01a558
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-03T07:59:21.897Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 105
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useArrivalEta` | function | `(ferryRoute: Route): ArrivalEtaResult` |
| `usePlannedArrival` | function | `(ferryRoute: Route, plannedDeparture: Date \| null, vehicle?: Vehicle): ArrivalEta \| null` |
| `ArrivalEta` | interface |  |
| `ArrivalKind` | type |  |
| `ArrivalEtaResult` | interface |  |

### Documented exports

- **`usePlannedArrival`** — Arrival for the sailing the leave-by plan targets (not the boat currently

## Imports

**Internal:**
- `../store/checkIn` (`getCheckIn`, `subscribeCheckIn`)
- `../types/storage` (`Vehicle`)
- `../utils/arrivalEtaLogic` (`selectActiveDeparture`, `etaDepartureBasis`)
- `../utils/arrivalPlan` (`ARRIVAL_CONFIG`, `ArrivalEta`, `computeArrival`)
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/time` (`parseDate`)
- `./useDailyTrends` (`useRecentTrends`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`, `useSyncExternalStore`)
