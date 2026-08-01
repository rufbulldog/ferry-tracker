---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: 81afb7b8f50d503ad3faf2a5fad287b44caaba991cf38ea578e3316e93fbcc5f
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.598Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 137
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
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/time` (`addMinutes`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`, `TypicalMethod`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`, `useSyncExternalStore`)
