---
type: l2-module
spec_version: 1
path: src/utils
file_count: 6
total_lines: 755
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.725Z
---

# src/utils — Module Spec

**Folder:** `src/utils`
**Files:** 6 · **Lines:** 755

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`arrivalEtaLogic.ts`](./arrivalEtaLogic.md) | 92 | The sailing the ETA is for. Normally the next sailing you'd board — the one |
| [`constants.ts`](./constants.md) | 50 |  |
| [`locations.ts`](./locations.md) | 94 |  |
| [`themes.ts`](./themes.md) | 426 |  |
| [`time.ts`](./time.md) | 56 |  |
| [`transitStats.ts`](./transitStats.md) | 37 |  |

## Public surface

Files in this folder imported from elsewhere:

- `arrivalEtaLogic.ts` — used by 1 file
  - `src/hooks/useArrivalEta.ts`
- `constants.ts` — used by 12 files
  - `app/(tabs)/index.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/context/RouteContext.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useRouteVessels.ts`
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalConditions.ts`
- `locations.ts` — used by 3 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`
  - `src/store/personalLocations.ts`
- `themes.ts` — used by 2 files
  - `app/(tabs)/settings.tsx`
  - `src/context/ThemeContext.tsx`
- `time.ts` — used by 8 files
  - `app/(tabs)/recommend.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
- `transitStats.ts` — used by 3 files
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTransitRecords.ts`

## Cross-refs

- Source folder: [`src/utils/`](../../../src/utils/)
