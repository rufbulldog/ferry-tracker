---
type: l1-file
spec_version: 1
source: src/utils/bestSailing.ts
content_sha: dcfbf7e516d1444877881113f672c954ed28462ca5fab10dcd329994374d70b7
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.719Z
---

# bestSailing.ts

**Path:** `src/utils/bestSailing.ts`
**Lines:** 172
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `estimateDriveMinutes` | function | `(distanceMeters: number): number` |
| `planCandidate` | function | `(c: SailingCandidate<T, R>, now: Date): SailingPick<T, R> \| null` |
| `pickBestSailing` | function | `(candidates: SailingCandidate<T, R>[], now: Date): BestSailingResult<T, R>` |
| `SailingLike` | interface |  |
| `LatLon` | interface |  |
| `SailingCandidate` | interface |  |
| `SailingPick` | interface |  |
| `BestSailingResult` | interface |  |
| `ROAD_DISTANCE_FACTOR` | const | `1.4` |
| `AVERAGE_DRIVE_KMH` | const | `50` |
| `DRIVE_OVERHEAD_MINUTES` | const | `2` |
| `AT_TERMINAL_METERS` | const | `400` |
| `MAX_DRIVE_MINUTES` | const | `90` |

### Documented exports

- **`pickBestSailing`** — Rank candidates by landing time on the far side; shorter drive breaks ties.

## Imports

**Internal:**
- `./constants` (`Route`)
- `./ferryDeparture` (`effectiveFerryDeparture`, `FerryDepartureLike`)
- `./time` (`addMinutes`)
