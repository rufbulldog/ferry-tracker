---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: 0277d37d4bb710682a9f7bcb032f4f01c4bef7a9bd760f6f7658bc592eeabfb8
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.304Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 159
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useArrivalEta` | function | `(ferryRoute: Route): ArrivalEtaResult` |
| `ArrivalKind` | type |  |
| `ArrivalEta` | interface |  |
| `ArrivalEtaResult` | interface |  |

## Imports

**Internal:**
- `../store/checkIn` (`getCheckIn`, `subscribeCheckIn`)
- `../types/storage` (`TransitRoute`, `Vehicle`)
- `../utils/arrivalEtaLogic` (`selectActiveDeparture`, `etaDepartureBasis`)
- `../utils/constants` (`Route`, `FERRY_TO_HOME_FALLBACK_MINUTES`, `HISTORY_MIN_SAMPLES`, `crossingMinutesForRoute`)
- `../utils/time` (`addMinutes`, `parseDate`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`, `TypicalMethod`)
- `../utils/typicalCrossing` (`typicalCrossingMinutes`)
- `./useDailyTrends` (`useRecentTrends`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`, `useSyncExternalStore`)
