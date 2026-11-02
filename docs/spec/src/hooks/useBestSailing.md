---
type: l1-file
spec_version: 1
source: src/hooks/useBestSailing.ts
content_sha: dfa1c916fed42e04eb62052634097554cf5b9b67d8d7b8158b0f776c8312fba7
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.423Z
---

# useBestSailing.ts

**Path:** `src/hooks/useBestSailing.ts`
**Lines:** 140
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useBestSailing` | function | `(): BestSailingState` |
| `BestSailingState` | interface |  |

### Documented exports

- **`useBestSailing`** — Best sailing to drive to from your current position, across both route

## Imports

**Internal:**
- `../context/RouteContext` (`useRoute`)
- `../utils/bestSailing` (`pickBestSailing`, `BestSailingResult`, `SailingCandidate`)
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/locations` (`getTerminalLocation`, `haversineDistance`)
- `../utils/routeGroups` (`ALL_ROUTE_GROUPS`, `ROUTE_GROUPS`, `RouteGroup`)
- `../utils/transitConfig` (`TRAVEL_TIMES`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useWatchedLocation` (`useWatchedLocation`)

**External:**
- `react` (`useEffect`, `useMemo`, `useState`)
