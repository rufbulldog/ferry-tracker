---
type: l1-file
spec_version: 1
source: src/hooks/useNextDepartures.ts
content_sha: 3fd61d93565876d4516761b73ce2e37d6c6b05c6d6390750a326aa3173a8faaf
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-09-14T02:10:09.316Z
---

# useNextDepartures.ts

**Path:** `src/hooks/useNextDepartures.ts`
**Lines:** 381
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useNextDepartures` | function | `(route: Route): { data: any; isLoading: false; isFetching: boolean; error: any; }` |
| `DepartureInfo` | interface |  |

## Imports

**Internal:**
- `../api/types` (`VesselLocation`)
- `../utils/constants` (`ROUTES`, `Route`)
- `../utils/predictedDelay` (`predictInboundDelay`, `PredictedDelayBasis`)
- `../utils/time` (`calculateDelayMinutes`, `getMinutesUntil`, `parseDate`, `addMinutes`)
- `./useTerminalConditions` (`useTerminalSailingSpace`)
- `./useVesselLocations` (`useVesselLocations`)

**External:**
- `react` (`useMemo`)
