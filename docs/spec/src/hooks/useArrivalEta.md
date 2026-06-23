---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: 8fefe2d819948523e433279522c2f5eac2bea4dc4170235ea97bb4c2b9e86080
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.656Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 112
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
- `../types/storage` (`TransitRoute`, `Vehicle`)
- `../utils/arrivalEtaLogic` (`selectActiveDeparture`, `projectedDockTime`, `etaDepartureBasis`)
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/time` (`addMinutes`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`, `TypicalMethod`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
