---
type: l1-file
spec_version: 1
source: src/hooks/useBestSailing.ts
content_sha: 7707a2a0d6afebce1df594c024f0c48a7d94ca382a1543f05d6ae182f2a012d4
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.851Z
---

# useBestSailing.ts

**Path:** `src/hooks/useBestSailing.ts`
**Lines:** 137
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
- `../utils/bestSailing` (`pickBestSailing`, `BestSailingResult`, `SailingCandidate`)
- `../utils/constants` (`Route`)
- `../utils/locations` (`getTerminalLocation`, `haversineDistance`)
- `../utils/transitConfig` (`TRAVEL_TIMES`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useWatchedLocation` (`useWatchedLocation`)

**External:**
- `react` (`useEffect`, `useMemo`, `useState`)
