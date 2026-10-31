---
type: l2-module
spec_version: 1
path: src/utils
file_count: 18
total_lines: 1878
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.596Z
---

# src/utils — Module Spec

**Folder:** `src/utils`
**Files:** 18 · **Lines:** 1878

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`arrivalEtaLogic.ts`](./arrivalEtaLogic.md) | 117 | The sailing the ETA is for. Normally the next sailing you'd board — the one |
| [`arrivalPlan.ts`](./arrivalPlan.md) | 115 | Arrival for a sailing leaving at `departureTime`. `liveEta` is the vessel's |
| [`capacityMeter.ts`](./capacityMeter.md) | 42 | Percent of drive-up space taken, 0–100, or null when space data is missing. |
| [`carWait.ts`](./carWait.md) | 220 | Parse a WSF terminalwaittimes note (vehicle wait). |
| [`constants.ts`](./constants.md) | 67 |  |
| [`dateHelpers.ts`](./dateHelpers.md) | 43 | Local YYYY-MM-DD (the format WSF's schedule endpoint expects as TripDate). |
| [`ferryDeparture.ts`](./ferryDeparture.md) | 80 | Resolve the effective departure for a sailing. Preference order: |
| [`kingstonBoardingPass.ts`](./kingstonBoardingPass.md) | 145 | Resolve the Kingston boarding-pass status for a given instant. |
| [`locations.ts`](./locations.md) | 90 |  |
| [`planEstimate.ts`](./planEstimate.md) | 101 |  |
| [`predictedDelay.ts`](./predictedDelay.md) | 98 |  |
| [`tabBarColors.ts`](./tabBarColors.md) | 76 |  |
| [`themes.ts`](./themes.md) | 426 |  |
| [`time.ts`](./time.md) | 56 |  |
| [`transitConfig.ts`](./transitConfig.md) | 50 |  |
| [`transitStats.ts`](./transitStats.md) | 37 |  |
| [`typicalConditions.ts`](./typicalConditions.md) | 68 |  |
| [`typicalCrossing.ts`](./typicalCrossing.md) | 47 |  |

## Public surface

Files in this folder imported from elsewhere:

- `arrivalEtaLogic.ts` — used by 1 file
  - `src/hooks/useArrivalEta.ts`
- `arrivalPlan.ts` — used by 2 files
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useArrivalEta.ts`
- `capacityMeter.ts` — used by 2 files
  - `src/components/CarMeter.tsx`
  - `src/components/MainDepartureCard.tsx`
- `carWait.ts` — used by 2 files
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `constants.ts` — used by 15 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `src/components/CarWaitChip.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/context/RouteContext.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useFutureSchedule.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalConditions.ts`
  - `src/store/checkIn.ts`
- `dateHelpers.ts` — used by 2 files
  - `app/planner.tsx`
  - `src/components/MonthCalendar.tsx`
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
- `planEstimate.ts` — used by 1 file
  - `app/planner.tsx`
- `predictedDelay.ts` — used by 1 file
  - `src/hooks/useNextDepartures.ts`
- `tabBarColors.ts` — used by 1 file
  - `app/(tabs)/_layout.tsx`
- `themes.ts` — used by 2 files
  - `app/(tabs)/settings.tsx`
  - `src/context/ThemeContext.tsx`
- `time.ts` — used by 11 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `src/components/ArrivingCard.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useFutureSchedule.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
- `transitConfig.ts` — used by 3 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `src/hooks/useRecommendation.ts`
- `transitStats.ts` — used by 2 files
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTransitRecords.ts`
- `typicalConditions.ts` — used by 2 files
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `typicalCrossing.ts`

## Cross-refs

- Source folder: [`src/utils/`](../../../src/utils/)
