---
type: l1-file
spec_version: 1
source: src/hooks/useNextDepartures.ts
content_sha: c28d540d04d479673fc30ac4c44fcdb15c70c9b9a91965e74728108d8f2ba34d
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.666Z
---

# useNextDepartures.ts

**Path:** `src/hooks/useNextDepartures.ts`
**Lines:** 334
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
