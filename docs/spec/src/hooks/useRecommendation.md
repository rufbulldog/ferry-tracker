---
type: l1-file
spec_version: 1
source: src/hooks/useRecommendation.ts
content_sha: 589718d0b7c8134af4ceff131243277407e44d3d2809508e6132e853c68a50d3
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.536Z
---

# useRecommendation.ts

**Path:** `src/hooks/useRecommendation.ts`
**Lines:** 240
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useRecommendation` | function | `(ferryRoute: Route, vehicle: Vehicle): RecommendationResult` |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`)
- `../utils/carWait` (`CarWaitEstimate`)
- `../utils/constants` (`Route`, `FERRY_TO_HOME_FALLBACK_MINUTES`, `HISTORY_MIN_SAMPLES`, `crossingMinutesForRoute`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`addMinutes`, `formatTime`)
- `../utils/transitConfig` (`TRAVEL_TIMES`, `TRANSIT_ROUTE_MAP`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`)
- `../utils/typicalConditions` (`computeTypicalForSlot`)
- `./useCarWait` (`useCarWait`)
- `./useDailyTrends` (`useRecentTrends`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTerminalBulletins` (`useTerminalBulletins`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
