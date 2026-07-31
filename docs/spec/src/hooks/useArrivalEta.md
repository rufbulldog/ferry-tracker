---
type: l1-file
spec_version: 1
source: src/hooks/useArrivalEta.ts
content_sha: 893e3129ff169df30111e59da090b9765668fd4559ab497002126de93320ac33
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.486Z
---

# useArrivalEta.ts

**Path:** `src/hooks/useArrivalEta.ts`
**Lines:** 111
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
- `../utils/arrivalEtaLogic` (`selectActiveDeparture`, `etaDepartureBasis`)
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/time` (`addMinutes`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`, `TypicalMethod`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
