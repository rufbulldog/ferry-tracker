---
type: l1-file
spec_version: 1
source: src/hooks/useNextDepartures.ts
content_sha: 6ce156cb2a26c900941a758c8df14a63a6c1e08f50064c11fa9f0b93f45af69e
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.686Z
---

# useNextDepartures.ts

**Path:** `src/hooks/useNextDepartures.ts`
**Lines:** 26
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `useNextDepartures` | function | `(route: Route): { data: {}; isLoading: false; isFetching: boolean; error: any; }` |
| `DepartureInfo` | interface |  |

## Imports

**Internal:**
- `../utils/composeDepartures` (`composeDepartures`)
- `../utils/constants` (`ROUTES`, `Route`)
- `./useTerminalConditions` (`useTerminalSailingSpace`)
- `./useVesselLocations` (`useVesselLocations`)

**External:**
- `react` (`useMemo`)
