---
type: l1-file
spec_version: 1
source: src/hooks/useBestSailing.ts
content_sha: 759f395b912d19f1b8a8ab181a7485feaf09b3068432a172671773a55f666690
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.668Z
---

# useBestSailing.ts

**Path:** `src/hooks/useBestSailing.ts`
**Lines:** 138
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
- `../utils/constants` (`Route`, `crossingMinutesForRoute`)
- `../utils/locations` (`getTerminalLocation`, `haversineDistance`)
- `../utils/transitConfig` (`TRAVEL_TIMES`)
- `./useCarWait` (`useCarWait`)
- `./useNextDepartures` (`useNextDepartures`, `DepartureInfo`)
- `./useWatchedLocation` (`useWatchedLocation`)

**External:**
- `react` (`useEffect`, `useMemo`, `useState`)
