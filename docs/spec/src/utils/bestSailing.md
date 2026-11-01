---
type: l1-file
spec_version: 1
source: src/utils/bestSailing.ts
content_sha: c3fe0c4234934ac0f0e069d22ab424723f43dbc8463a7cd57aa976a8f3e727c5
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.894Z
---

# bestSailing.ts

**Path:** `src/utils/bestSailing.ts`
**Lines:** 169
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `estimateDriveMinutes` | function | `(distanceMeters: number): number` |
| `planCandidate` | function | `(c: SailingCandidate<T>, now: Date): SailingPick<T> \| null` |
| `pickBestSailing` | function | `(candidates: SailingCandidate<T>[], now: Date): BestSailingResult<T>` |
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
- `./constants` (`Route`, `crossingMinutesForRoute`)
- `./ferryDeparture` (`effectiveFerryDeparture`, `FerryDepartureLike`)
- `./time` (`addMinutes`)
