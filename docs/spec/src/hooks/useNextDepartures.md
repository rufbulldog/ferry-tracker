---
type: l1-file
spec_version: 1
source: src/hooks/useNextDepartures.ts
content_sha: 49ee18b85430f8fdea9d0bc863e4c081376d3222e016da4cf1722beb4ad16721
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-07-31T23:25:27.496Z
---

# useNextDepartures.ts

**Path:** `src/hooks/useNextDepartures.ts`
**Lines:** 337
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useNextDepartures` | function | `(route: Route): { data: any; isLoading: false; isFetching: boolean; error: any; }` |
| `DepartureInfo` | interface |  |
| `MIN_TURNAROUND_MINUTES` | const | `5` |

## Imports

**Internal:**
- `../api/types` (`VesselLocation`)
- `../utils/constants` (`ROUTES`, `Route`)
- `../utils/time` (`calculateDelayMinutes`, `getMinutesUntil`, `parseDate`, `addMinutes`)
- `./useTerminalConditions` (`useTerminalSailingSpace`)
- `./useVesselLocations` (`useVesselLocations`)

**External:**
- `react` (`useMemo`)
