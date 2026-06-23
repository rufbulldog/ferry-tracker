---
type: l1-file
spec_version: 1
source: src/hooks/useRecommendation.ts
content_sha: 6a514caa74ccb849d2983841cad11d4bf4fb4ae290f1124cf04348aaed98b439
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.672Z
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
- `../types/storage` (`Vehicle`, `TransitRoute`)
- `../utils/constants` (`Route`, `FERRY_CROSSING_MINUTES`, `FERRY_TO_HOME_FALLBACK_MINUTES`)
- `../utils/time` (`addMinutes`, `formatTime`)
- `../utils/transitStats` (`computeTypicalTransitSeconds`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useTerminalBulletins` (`useTerminalBulletins`)
- `./useTransitRecords` (`useTransitRecords`)

**External:**
- `react` (`useMemo`)
