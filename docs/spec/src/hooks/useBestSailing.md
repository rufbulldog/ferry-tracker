---
type: l1-file
spec_version: 1
source: src/hooks/useBestSailing.ts
content_sha: 0835875cdd03352361c572abb64df7a3d05c378f826c1536e0ffef7d6f275119
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T04:57:17.756Z
---

# useBestSailing.ts

**Path:** `src/hooks/useBestSailing.ts`
**Lines:** 214
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
- `../utils/bestSailing` (`DriveAround`, `pickBestSailing`, `planDriveAround`, `BestSailingResult`, `SailingCandidate`)
- `../utils/commute` (`isAwayFromCommute`)
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/locations` (`getPublicTerminals`, `getTerminalLocation`, `haversineDistance`)
- `../utils/routeGroups` (`ALL_ROUTE_GROUPS`, `ROUTE_GROUPS`, `RouteGroup`)
- `../utils/transitConfig` (`TRAVEL_TIMES`)
- `./useCarWait` (`useCarWait`)
- `./useDriveTimes` (`DrivePoint`, `useDriveTimes`, `useDriveTimesTo`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useWatchedLocation` (`useWatchedLocation`)

**External:**
- `react` (`useEffect`, `useMemo`, `useState`)
