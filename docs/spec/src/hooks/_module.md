---
type: l2-module
spec_version: 1
path: src/hooks
file_count: 17
total_lines: 1975
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.901Z
---

# src/hooks — Module Spec

**Folder:** `src/hooks`
**Files:** 17 · **Lines:** 1975

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`useArrivalEta.ts`](./useArrivalEta.md) | 98 | Arrival for the sailing the leave-by plan targets (not the boat currently |
| [`useBestSailing.ts`](./useBestSailing.md) | 137 | Best sailing to drive to from your current position, across both route |
| [`useCarWait.ts`](./useCarWait.md) | 76 | Combine live capacity, WSF wait-time notes, WSF alerts, and recorded history |
| [`useDailyTrends.ts`](./useDailyTrends.md) | 124 |  |
| [`useFutureSchedule.ts`](./useFutureSchedule.md) | 49 | Full sailing list for a route on a given date (YYYY-MM-DD). Schedules are |
| [`useLatestDeparture.ts`](./useLatestDeparture.md) | 61 |  |
| [`useLiveActivity.ts`](./useLiveActivity.md) | 107 | Mirror the best-sailing plan into a Live Activity (Lock Screen, Dynamic |
| [`useNextDepartures.ts`](./useNextDepartures.md) | 381 |  |
| [`useRecommendation.ts`](./useRecommendation.md) | 240 |  |
| [`useTerminalBulletins.ts`](./useTerminalBulletins.md) | 164 |  |
| [`useTerminalConditions.ts`](./useTerminalConditions.md) | 29 |  |
| [`useTerminalWaitTimes.ts`](./useTerminalWaitTimes.md) | 29 | WSF vehicle wait-time notes for a terminal. The `/wsf/waittimes/{id}` proxy |
| [`useTimer.ts`](./useTimer.md) | 198 |  |
| [`useTransitRecords.ts`](./useTransitRecords.md) | 131 |  |
| [`useUserLocation.ts`](./useUserLocation.md) | 72 |  |
| [`useVesselLocations.ts`](./useVesselLocations.md) | 12 |  |
| [`useWatchedLocation.ts`](./useWatchedLocation.md) | 67 | Continuously updated position while the app is in the foreground — for the |

## Public surface

Files in this folder imported from elsewhere:

- `useArrivalEta.ts` — used by 2 files
  - `app/(tabs)/index.tsx`
  - `src/components/CheckInFAB.tsx`
- `useBestSailing.ts` — used by 1 file
  - `src/context/BestSailingContext.tsx`
- `useCarWait.ts` — used by 1 file
  - `src/components/CarWaitChip.tsx`
- `useDailyTrends.ts` — used by 2 files
  - `app/(tabs)/trends.tsx`
  - `app/planner.tsx`
- `useFutureSchedule.ts` — used by 1 file
  - `app/planner.tsx`
- `useLatestDeparture.ts` — used by 1 file
  - `app/(tabs)/index.tsx`
- `useLiveActivity.ts` — used by 1 file
  - `src/context/BestSailingContext.tsx`
- `useNextDepartures.ts` — used by 6 files
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/timer.tsx`
  - `app/(tabs)/trends.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
- `useRecommendation.ts` — used by 1 file
  - `app/(tabs)/index.tsx`
- `useTerminalBulletins.ts` — used by 2 files
  - `app/(tabs)/index.tsx`
  - `src/components/AlertBanner.tsx`
- `useTimer.ts` — used by 1 file
  - `app/(tabs)/timer.tsx`
- `useTransitRecords.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/planner.tsx`
- `useUserLocation.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `useTerminalConditions.ts`
- `useTerminalWaitTimes.ts`
- `useVesselLocations.ts`
- `useWatchedLocation.ts`

## Cross-refs

- Source folder: [`src/hooks/`](../../../src/hooks/)
