---
type: l2-module
spec_version: 1
path: src/hooks
file_count: 14
total_lines: 1625
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-08-02T05:28:25.726Z
---

# src/hooks — Module Spec

**Folder:** `src/hooks`
**Files:** 14 · **Lines:** 1625

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`useArrivalEta.ts`](./useArrivalEta.md) | 137 |  |
| [`useCarWait.ts`](./useCarWait.md) | 76 | Combine live capacity, WSF wait-time notes, WSF alerts, and recorded history |
| [`useDailyTrends.ts`](./useDailyTrends.md) | 124 |  |
| [`useFutureSchedule.ts`](./useFutureSchedule.md) | 49 | Full sailing list for a route on a given date (YYYY-MM-DD). Schedules are |
| [`useLatestDeparture.ts`](./useLatestDeparture.md) | 61 |  |
| [`useNextDepartures.ts`](./useNextDepartures.md) | 337 |  |
| [`useRecommendation.ts`](./useRecommendation.md) | 206 |  |
| [`useTerminalBulletins.ts`](./useTerminalBulletins.md) | 164 |  |
| [`useTerminalConditions.ts`](./useTerminalConditions.md) | 29 |  |
| [`useTerminalWaitTimes.ts`](./useTerminalWaitTimes.md) | 29 | WSF vehicle wait-time notes for a terminal. The `/wsf/waittimes/{id}` proxy |
| [`useTimer.ts`](./useTimer.md) | 198 |  |
| [`useTransitRecords.ts`](./useTransitRecords.md) | 131 |  |
| [`useUserLocation.ts`](./useUserLocation.md) | 72 |  |
| [`useVesselLocations.ts`](./useVesselLocations.md) | 12 |  |

## Public surface

Files in this folder imported from elsewhere:

- `useArrivalEta.ts` — used by 2 files
  - `app/(tabs)/recommend.tsx`
  - `src/components/CheckInFAB.tsx`
- `useCarWait.ts` — used by 1 file
  - `src/components/CarWaitChip.tsx`
- `useDailyTrends.ts` — used by 2 files
  - `app/(tabs)/trends.tsx`
  - `app/planner.tsx`
- `useFutureSchedule.ts` — used by 1 file
  - `app/planner.tsx`
- `useLatestDeparture.ts` — used by 1 file
  - `app/(tabs)/index.tsx`
- `useNextDepartures.ts` — used by 5 files
  - `app/(tabs)/index.tsx`
  - `src/components/ArrivingCard.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
- `useRecommendation.ts` — used by 1 file
  - `app/(tabs)/recommend.tsx`
- `useTerminalBulletins.ts` — used by 2 files
  - `app/(tabs)/index.tsx`
  - `src/components/AlertBanner.tsx`
- `useTimer.ts` — used by 1 file
  - `app/(tabs)/timer.tsx`
- `useTransitRecords.ts` — used by 3 files
  - `app/(tabs)/timer.tsx`
  - `app/(tabs)/trends.tsx`
  - `app/planner.tsx`
- `useUserLocation.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `useTerminalConditions.ts`
- `useTerminalWaitTimes.ts`
- `useVesselLocations.ts`

## Cross-refs

- Source folder: [`src/hooks/`](../../../src/hooks/)
