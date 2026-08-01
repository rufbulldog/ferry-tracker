---
type: l1-file
spec_version: 1
source: src/hooks/useRecommendation.ts
content_sha: cb027d14823b2fe108aba49aec0cdc47b7e47a71c0fa765ecc429cfbeacb10d4
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.619Z
---

# useRecommendation.ts

**Path:** `src/hooks/useRecommendation.ts`
**Lines:** 247
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useRecommendation` | function | `(ferryRoute: Route, vehicle: Vehicle): RecommendationResult` |

## Imports

**Internal:**
- `../types/storage` (`Vehicle`, `TransitRoute`)
- `../utils/carWait` (`CarWaitEstimate`)
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/ferryDeparture` (`effectiveFerryDeparture`)
- `../utils/time` (`addMinutes`, `formatTime`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTerminalBulletins` (`useTerminalBulletins`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
