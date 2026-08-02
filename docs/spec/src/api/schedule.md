---
type: l1-file
spec_version: 1
source: src/api/schedule.ts
content_sha: e761080cf7b30fed3df413aed86d7a250ebab6b1103524152901667dcad1a3c0
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.653Z
---

# schedule.ts

**Path:** `src/api/schedule.ts`
**Lines:** 34
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `fetchScheduleToday` | function | `(routeId: number, onlyRemainingTimes: boolean = true): Promise<ScheduledSailing[]>` |
| `fetchScheduleForDate` | function | `(tripDate: string, departingTerminalId: number, arrivingTerminalId: number): Promise<ScheduleByDateResponse>` |
| `fetchValidDateRange` | function | `(): Promise<ValidDateRange>` |

### Documented exports

- **`fetchScheduleForDate`** — Full sailing schedule for a specific date and terminal pair (future planning).
- **`fetchValidDateRange`** — The date window WSF currently publishes schedules for.

## Imports

**Internal:**
- `./client` (`scheduleApi`)
- `./types` (`ScheduledSailing`, `ScheduleByDateResponse`, `ValidDateRange`)
