---
type: l1-file
spec_version: 1
source: src/utils/timerLegs.ts
content_sha: 165c61352a6e6b75fc9f3b3ec2fd6aaa69f9697947b9c61c5efcf54c5228696b
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T06:16:16.512Z
---

# timerLegs.ts

**Path:** `src/utils/timerLegs.ts`
**Lines:** 127
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `getLeg` | function | `(id: TimerLegId): TimerLeg` |
| `recordLabel` | function | `(route: TransitRoute, vehicle: Vehicle): string` |
| `legStats` | function | `(records: TransitRecord[] \| undefined, route: TransitRoute, vehicle: Vehicle): LegStats` |
| `currentPeriod` | function | `(now: Date = new Date()): LegPeriod` |
| `paceAgainstTypical` | function | `(elapsedSeconds: number, typicalSeconds: number): Pace` |
| `sailingOnPaceFor` | function | `(departures: Date[], remainingSeconds: number, now: Date = new Date()): { departure: Date; arrive: Date; spareMinutes: number } \| null` |
| `formatClock` | function | `(totalSeconds: number): string` |
| `formatMinSec` | function | `(totalSeconds: number): string` |
| `TimerLegId` | type |  |
| `LegPeriod` | type |  |
| `TimerLeg` | interface |  |
| `TIMER_LEGS` | const | `TimerLeg[]` |
| `LegStats` | interface |  |
| `Pace` | interface |  |

### Documented exports

- **`recordLabel`** — Label for a saved record. Car home→ferry is shared by Bainbridge and Kingston.
- **`currentPeriod`** — Morning legs before noon, evening after — the leg list opens on the current half.
- **`sailingOnPaceFor`** — The first departure you'd make if you arrive in `remainingSeconds` (never
- **`formatClock`** — "7:45" for seconds, "1:02:10" past an hour.
- **`formatMinSec`** — "8m 23s", "1h 2m" — for lists, where m:ss could be mistaken for a clock time.

## Imports

**Internal:**
- `../types/storage` (`TransitRecord`, `TransitRoute`, `Vehicle`)
- `./constants` (`Route`)
- `./transitStats` (`computeTypicalTransitSeconds`)
