---
type: l1-file
spec_version: 1
source: src/hooks/useRecommendation.ts
content_sha: 7daf78dea44abee2299de15b4e967c5756444d696b3ddf15d7955be576d27115
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.690Z
---

# useRecommendation.ts

**Path:** `src/hooks/useRecommendation.ts`
**Lines:** 206
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useRecommendation` | function | `(ferryRoute: Route, vehicle: Vehicle): RecommendationResult` |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`)
- `../utils/carWait` (`CarWaitEstimate`)
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`addMinutes`, `formatTime`)
- `../utils/transitConfig` (`TRAVEL_TIMES`, `TRANSIT_ROUTE_MAP`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTerminalBulletins` (`useTerminalBulletins`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
