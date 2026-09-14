---
type: l1-file
spec_version: 1
source: src/hooks/useRecommendation.ts
content_sha: b19d602c5c9322bc422304aef5fb4ac8310daead63249c1038b99d5f0345a390
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.321Z
---

# useRecommendation.ts

**Path:** `src/hooks/useRecommendation.ts`
**Lines:** 234
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
