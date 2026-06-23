---
type: l1-file
spec_version: 1
source: src/api/schedule.ts
content_sha: 06cdb3bee8125e63fa82e2bb4a8a76e76c744ecc6c550c612eb76a33cfad9a81
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.639Z
---

# schedule.ts

**Path:** `src/api/schedule.ts`
**Lines:** 13
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `fetchScheduleToday` | function | `(routeId: number, onlyRemainingTimes: boolean = true): Promise<ScheduledSailing[]>` |

## Imports

**Internal:**
- `./client` (`scheduleApi`)
- `./types` (`ScheduledSailing`)
