---
type: l2-module
spec_version: 1
path: src/utils
file_count: 10
total_lines: 1277
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.661Z
---

# src/utils — Module Spec

**Folder:** `src/utils`
**Files:** 10 · **Lines:** 1277

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`arrivalEtaLogic.ts`](./arrivalEtaLogic.md) | 106 | The sailing the ETA is for. Normally the next sailing you'd board — the one |
| [`carWait.ts`](./carWait.md) | 220 | Parse a WSF terminalwaittimes note (vehicle wait). |
| [`constants.ts`](./constants.md) | 49 |  |
| [`ferryDeparture.ts`](./ferryDeparture.md) | 80 | Resolve the effective departure for a sailing. Preference order: |
| [`kingstonBoardingPass.ts`](./kingstonBoardingPass.md) | 145 | Resolve the Kingston boarding-pass status for a given instant. |
| [`locations.ts`](./locations.md) | 90 |  |
| [`themes.ts`](./themes.md) | 426 |  |
| [`time.ts`](./time.md) | 56 |  |
| [`transitStats.ts`](./transitStats.md) | 37 |  |
| [`typicalConditions.ts`](./typicalConditions.md) | 68 |  |

## Public surface

Files in this folder imported from elsewhere:

- `arrivalEtaLogic.ts` — used by 1 file
  - `src/hooks/useArrivalEta.ts`
- `carWait.ts` — used by 2 files
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `constants.ts` — used by 13 files
  - `app/(tabs)/index.tsx`
  - `src/components/CarWaitChip.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/context/RouteContext.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalConditions.ts`
  - `src/store/checkIn.ts`
- `ferryDeparture.ts` — used by 4 files
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `kingstonBoardingPass.ts` — used by 1 file
  - `src/components/KingstonBoardingPassPill.tsx`
- `locations.ts` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`
- `themes.ts` — used by 2 files
  - `app/(tabs)/settings.tsx`
  - `src/context/ThemeContext.tsx`
- `time.ts` — used by 9 files
  - `app/(tabs)/recommend.tsx`
  - `src/components/ArrivingCard.tsx`
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
- `typicalConditions.ts` — used by 1 file
  - `src/hooks/useCarWait.ts`

## Cross-refs

- Source folder: [`src/utils/`](../../../src/utils/)
