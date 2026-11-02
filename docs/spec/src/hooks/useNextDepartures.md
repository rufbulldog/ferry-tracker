---
type: l1-file
spec_version: 1
source: src/hooks/useNextDepartures.ts
content_sha: aa38e8a4de701355c062df10d0f26aa16bd4d0f6c3f729c91b4bda8dbef7b90d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:07:16.444Z
---

# useNextDepartures.ts

**Path:** `src/hooks/useNextDepartures.ts`
**Lines:** 52
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useNextDepartures` | function | `(route: Route): { data: {}; isLoading: false; isFetching: boolean; error: any; }` |
| `DepartureInfo` | interface |  |

## Imports

**Internal:**
- `../api/schedule` (`fetchScheduleForDate`)
- `../utils/composeDepartures` (`composeRouteDepartures`, `hasRouteSailingSpace`)
- `../utils/constants` (`ROUTES`, `Route`)
- `./useTerminalConditions` (`useTerminalSailingSpace`)
- `./useVesselLocations` (`useVesselLocations`)

**External:**
- `@tanstack/react-query` (`useQuery`)
- `react` (`useMemo`)
