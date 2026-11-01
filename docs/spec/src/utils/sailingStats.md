---
type: l1-file
spec_version: 1
source: src/utils/sailingStats.ts
content_sha: 1f2e8ab2eb0e709956b59a24df83442ca34f123aa0a808f3d95759659ab27faa
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T06:16:16.510Z
---

# sailingStats.ts

**Path:** `src/utils/sailingStats.ts`
**Lines:** 177
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `delayBand` | function | `(delayMinutes: number): DelayBand` |
| `dayTypeOf` | function | `(date: Date): DayType` |
| `sailingMinute` | function | `(scheduledTime: string): number` |
| `serviceOrder` | function | `(minuteOfDay: number): number` |
| `sailingLabel` | function | `(minuteOfDay: number): string` |
| `summarizeSailings` | function | `(snapshots: DepartureSnapshot[] \| undefined, dayType: DayType): SailingSummary[]` |
| `pickSailing` | function | `(sailings: SailingSummary[], preferredMinute: number): SailingSummary \| null` |
| `windowAround` | function | `(items: T[], minuteOfDay: number \| undefined, size: number): T[]` |
| `buildReliabilityGrid` | function | `(snapshots: DepartureSnapshot[] \| undefined, dayType: DayType, maxDays = 10): ReliabilityGrid` |
| `DayType` | type |  |
| `ON_TIME_MAX_MINUTES` | const | `3` |
| `VERY_LATE_MINUTES` | const | `10` |
| `DelayBand` | type |  |
| `SailingSummary` | interface |  |
| `GridCell` | interface |  |
| `ReliabilityGrid` | interface |  |

### Documented exports

- **`sailingMinute`** — Minutes after local midnight of a snapshot's scheduled departure.
- **`serviceOrder`** — Sort key that puts after-midnight sailings at the end of the day.
- **`sailingLabel`** — "7:55 AM", "12:10 PM" — matches the Ferry tab's times.
- **`summarizeSailings`** — One row per scheduled sailing time for the given day type, in service-day order.
- **`pickSailing`** — The sailing a summary list should open on: the first one at or after
- **`windowAround`** — Up to `size` consecutive items centred on the one matching `minuteOfDay`, so a
- **`buildReliabilityGrid`** — Sailing × day grid over the most recent `maxDays` dates of this day type that

## Imports

**Internal:**
- `../types/storage` (`DepartureSnapshot`)
- `./typicalConditions` (`trimmedMean`)
