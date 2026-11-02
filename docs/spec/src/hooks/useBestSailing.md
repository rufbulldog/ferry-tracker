---
type: l1-file
spec_version: 1
source: src/hooks/useBestSailing.ts
content_sha: 0b2df0e4f3287143e6861ff8a14bc39797180f886f28a9801320ef6cd2d474f6
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:33:00.955Z
---

# useBestSailing.ts

**Path:** `src/hooks/useBestSailing.ts`
**Lines:** 156
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
- `../store/personalLocations` (`getPersonalLocations`)
- `../utils/bestSailing` (`pickBestSailing`, `BestSailingResult`, `SailingCandidate`)
- `../utils/commute` (`isAwayFromCommute`)
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/locations` (`getPublicTerminals`, `getTerminalLocation`, `haversineDistance`)
- `../utils/routeGroups` (`ALL_ROUTE_GROUPS`, `ROUTE_GROUPS`, `RouteGroup`)
- `../utils/transitConfig` (`TRAVEL_TIMES`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useWatchedLocation` (`useWatchedLocation`)

**External:**
- `react` (`useEffect`, `useMemo`, `useState`)
