---
type: l2-module
spec_version: 1
path: src/api
file_count: 6
total_lines: 332
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.726Z
---

# src/api — Module Spec

**Folder:** `src/api`
**Files:** 6 · **Lines:** 332

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`backend.ts`](./backend.md) | 88 |  |
| [`client.ts`](./client.md) | 12 |  |
| [`schedule.ts`](./schedule.md) | 34 | Full sailing schedule for a specific date and terminal pair (future planning). |
| [`terminals.ts`](./terminals.md) | 18 |  |
| [`types.ts`](./types.md) | 172 |  |
| [`vessels.ts`](./vessels.md) | 8 |  |

## Public surface

Files in this folder imported from elsewhere:

- `backend.ts` — used by 3 files
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useTransitRecords.ts`
- `schedule.ts` — used by 1 file
  - `src/hooks/useFutureSchedule.ts`
- `terminals.ts` — used by 3 files
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalConditions.ts`
  - `src/hooks/useTerminalWaitTimes.ts`
- `types.ts` — used by 3 files
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalWaitTimes.ts`
- `vessels.ts` — used by 1 file
  - `src/hooks/useVesselLocations.ts`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `client.ts`

## Cross-refs

- Source folder: [`src/api/`](../../../src/api/)
