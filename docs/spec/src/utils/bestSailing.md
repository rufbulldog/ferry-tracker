---
type: l1-file
spec_version: 1
source: src/utils/bestSailing.ts
content_sha: 1af0e2329cd5b53c08769f437c4bd79b5610ae2e739050a5f0a16bea90df1e93
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-02T03:53:15.289Z
---

# bestSailing.ts

**Path:** `src/utils/bestSailing.ts`
**Lines:** 227
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `estimateDriveMinutes` | function | `(distanceMeters: number): number` |
| `planCandidate` | function | `(c: SailingCandidate<T, R>, now: Date): SailingPick<T, R> \| null` |
| `pickBestSailing` | function | `(candidates: SailingCandidate<T, R>[], now: Date): BestSailingResult<T, R>` |
| `planDriveAround` | function | `(directMinutes: number \| null \| undefined, best: SailingPick<T, R> \| null, now: Date): DriveAround \| null` |
| `driveAroundWins` | function | `(d: DriveAround \| null): boolean` |
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
| `DriveAround` | interface |  |
| `DRIVE_AROUND_MARGIN_MINUTES` | const | `5` |

### Documented exports

- **`pickBestSailing`** — Rank candidates by when you get home when every pick knows that, else by
- **`planDriveAround`** — Skip the ferry and drive home around the Sound — compared with the best ferry.
- **`driveAroundWins`** — True when driving around beats every ferry home by a clear margin.

## Imports

**Internal:**
- `./constants` (`Route`)
- `./ferryDeparture` (`effectiveFerryDeparture`, `FerryDepartureLike`)
- `./time` (`addMinutes`)
