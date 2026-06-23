---
type: l2-module
spec_version: 1
path: src/hooks
file_count: 12
total_lines: 1457
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.724Z
---

# src/hooks — Module Spec

**Folder:** `src/hooks`
**Files:** 12 · **Lines:** 1457

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`useArrivalEta.ts`](./useArrivalEta.md) | 112 |  |
| [`useDailyTrends.ts`](./useDailyTrends.md) | 124 |  |
| [`useLatestDeparture.ts`](./useLatestDeparture.md) | 61 |  |
| [`useNextDepartures.ts`](./useNextDepartures.md) | 334 |  |
| [`useRecommendation.ts`](./useRecommendation.md) | 206 |  |
| [`useRouteVessels.ts`](./useRouteVessels.md) | 21 |  |
| [`useTerminalBulletins.ts`](./useTerminalBulletins.md) | 159 |  |
| [`useTerminalConditions.ts`](./useTerminalConditions.md) | 29 |  |
| [`useTimer.ts`](./useTimer.md) | 198 |  |
| [`useTransitRecords.ts`](./useTransitRecords.md) | 131 |  |
| [`useUserLocation.ts`](./useUserLocation.md) | 70 |  |
| [`useVesselLocations.ts`](./useVesselLocations.md) | 12 |  |

## Public surface

Files in this folder imported from elsewhere:

- `useArrivalEta.ts` — used by 2 files
  - `app/(tabs)/recommend.tsx`
  - `src/components/CheckInFAB.tsx`
- `useDailyTrends.ts` — used by 1 file
  - `app/(tabs)/trends.tsx`
- `useLatestDeparture.ts` — used by 1 file
  - `app/(tabs)/index.tsx`
- `useNextDepartures.ts` — used by 4 files
  - `app/(tabs)/index.tsx`
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
- `useTransitRecords.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/(tabs)/trends.tsx`
- `useUserLocation.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `useRouteVessels.ts`
- `useTerminalConditions.ts`
- `useVesselLocations.ts`

## Cross-refs

- Source folder: [`src/hooks/`](../../../src/hooks/)
