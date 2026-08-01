---
type: l2-module
spec_version: 1
path: src/api
file_count: 6
total_lines: 275
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.658Z
---

# src/api — Module Spec

**Folder:** `src/api`
**Files:** 6 · **Lines:** 275

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`backend.ts`](./backend.md) | 88 |  |
| [`client.ts`](./client.md) | 12 |  |
| [`schedule.ts`](./schedule.md) | 13 |  |
| [`terminals.ts`](./terminals.md) | 18 |  |
| [`types.ts`](./types.md) | 136 |  |
| [`vessels.ts`](./vessels.md) | 8 |  |

## Public surface

Files in this folder imported from elsewhere:

- `backend.ts` — used by 3 files
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useTransitRecords.ts`
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
- `schedule.ts`

## Cross-refs

- Source folder: [`src/api/`](../../../src/api/)
