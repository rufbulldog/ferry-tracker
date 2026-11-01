---
type: l2-module
spec_version: 1
path: src/utils
file_count: 21
total_lines: 2379
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-11-01T19:07:47.901Z
---

# src/utils — Module Spec

**Folder:** `src/utils`
**Files:** 21 · **Lines:** 2379

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`arrivalEtaLogic.ts`](./arrivalEtaLogic.md) | 117 | The sailing the ETA is for. Normally the next sailing you'd board — the one |
| [`arrivalPlan.ts`](./arrivalPlan.md) | 115 | Arrival for a sailing leaving at `departureTime`. `liveEta` is the vessel's |
| [`bestSailing.ts`](./bestSailing.md) | 169 | Rank candidates by landing time on the far side; shorter drive breaks ties. |
| [`capacityMeter.ts`](./capacityMeter.md) | 42 | Percent of drive-up space taken, 0–100, or null when space data is missing. |
| [`carWait.ts`](./carWait.md) | 220 | Parse a WSF terminalwaittimes note (vehicle wait). |
| [`constants.ts`](./constants.md) | 67 |  |
| [`dateHelpers.ts`](./dateHelpers.md) | 43 | Local YYYY-MM-DD (the format WSF's schedule endpoint expects as TripDate). |
| [`ferryDeparture.ts`](./ferryDeparture.md) | 80 | Resolve the effective departure for a sailing. Preference order: |
| [`kingstonBoardingPass.ts`](./kingstonBoardingPass.md) | 145 | Resolve the Kingston boarding-pass status for a given instant. |
| [`locations.ts`](./locations.md) | 118 | A public ferry terminal by its location id (e.g. 'kingston-terminal'). |
| [`planEstimate.ts`](./planEstimate.md) | 101 |  |
| [`predictedDelay.ts`](./predictedDelay.md) | 98 |  |
| [`sailingStats.ts`](./sailingStats.md) | 177 | Minutes after local midnight of a snapshot's scheduled departure. |
| [`tabBarColors.ts`](./tabBarColors.md) | 76 |  |
| [`themes.ts`](./themes.md) | 426 |  |
| [`time.ts`](./time.md) | 56 |  |
| [`timerLegs.ts`](./timerLegs.md) | 127 | Label for a saved record. Car home→ferry is shared by Bainbridge and Kingston. |
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
- `bestSailing.ts` — used by 2 files
  - `src/hooks/useBestSailing.ts`
  - `src/hooks/useLiveActivity.ts`
- `capacityMeter.ts` — used by 3 files
  - `app/(tabs)/trends.tsx`
  - `src/components/CarMeter.tsx`
  - `src/components/MainDepartureCard.tsx`
- `carWait.ts` — used by 2 files
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `constants.ts` — used by 18 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `src/components/BestSailingCard.tsx`
  - `src/components/CarWaitChip.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/context/RouteContext.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useBestSailing.ts`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useDailyTrends.ts`
  - `src/hooks/useFutureSchedule.ts`
  - `src/hooks/useLatestDeparture.ts`
  - `src/hooks/useLiveActivity.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTerminalBulletins.ts`
  - `src/hooks/useTerminalConditions.ts`
  - `src/store/checkIn.ts`
- `dateHelpers.ts` — used by 2 files
  - `app/planner.tsx`
  - `src/components/MonthCalendar.tsx`
- `ferryDeparture.ts` — used by 5 files
  - `app/(tabs)/timer.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `kingstonBoardingPass.ts` — used by 1 file
  - `src/components/KingstonBoardingPassPill.tsx`
- `locations.ts` — used by 3 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`
  - `src/hooks/useBestSailing.ts`
- `planEstimate.ts` — used by 1 file
  - `app/planner.tsx`
- `predictedDelay.ts` — used by 1 file
  - `src/hooks/useNextDepartures.ts`
- `sailingStats.ts` — used by 1 file
  - `app/(tabs)/trends.tsx`
- `tabBarColors.ts` — used by 1 file
  - `app/(tabs)/_layout.tsx`
- `themes.ts` — used by 3 files
  - `app/(tabs)/settings.tsx`
  - `app/(tabs)/trends.tsx`
  - `src/context/ThemeContext.tsx`
- `time.ts` — used by 13 files
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/timer.tsx`
  - `app/planner.tsx`
  - `src/components/BestSailingCard.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useFutureSchedule.ts`
  - `src/hooks/useLiveActivity.ts`
  - `src/hooks/useNextDepartures.ts`
  - `src/hooks/useRecommendation.ts`
- `timerLegs.ts` — used by 1 file
  - `app/(tabs)/timer.tsx`
- `transitConfig.ts` — used by 4 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `src/hooks/useBestSailing.ts`
  - `src/hooks/useRecommendation.ts`
- `transitStats.ts` — used by 2 files
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTransitRecords.ts`
- `typicalConditions.ts` — used by 2 files
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `typicalCrossing.ts` — used by 1 file
  - `app/(tabs)/trends.tsx`

## Cross-refs

- Source folder: [`src/utils/`](../../../src/utils/)
