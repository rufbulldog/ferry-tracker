---
type: l2-module
spec_version: 1
path: src/utils
file_count: 24
total_lines: 2910
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-11-02T02:40:10.726Z
---

# src/utils — Module Spec

**Folder:** `src/utils`
**Files:** 24 · **Lines:** 2910

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`arrivalEtaLogic.ts`](./arrivalEtaLogic.md) | 117 | The sailing the ETA is for. Normally the next sailing you'd board — the one |
| [`arrivalPlan.ts`](./arrivalPlan.md) | 115 | Arrival for a sailing leaving at `departureTime`. `liveEta` is the vessel's |
| [`bestSailing.ts`](./bestSailing.md) | 172 | Rank candidates by landing time on the far side; shorter drive breaks ties. |
| [`bulletins.ts`](./bulletins.md) | 156 | Route-relevant bulletins, alerts first then newest. `route` is matched by the |
| [`capacityMeter.ts`](./capacityMeter.md) | 42 | Percent of drive-up space taken, 0–100, or null when space data is missing. |
| [`carWait.ts`](./carWait.md) | 220 | Parse a WSF terminalwaittimes note (vehicle wait). |
| [`composeDepartures.ts`](./composeDepartures.md) | 367 |  |
| [`constants.ts`](./constants.md) | 67 |  |
| [`dateHelpers.ts`](./dateHelpers.md) | 43 | Local YYYY-MM-DD (the format WSF's schedule endpoint expects as TripDate). |
| [`ferryDeparture.ts`](./ferryDeparture.md) | 80 | Resolve the effective departure for a sailing. Preference order: |
| [`geo.ts`](./geo.md) | 19 | Haversine distance in meters between two lat/lon points. |
| [`kingstonBoardingPass.ts`](./kingstonBoardingPass.md) | 145 | Resolve the Kingston boarding-pass status for a given instant. |
| [`locations.ts`](./locations.md) | 104 | A public ferry terminal by its location id (e.g. 'kingston-terminal'). |
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
- `bestSailing.ts` — used by 3 files
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useBestSailing.ts`
  - `src/hooks/useLiveActivity.ts`
- `bulletins.ts` — used by 2 files
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useTerminalBulletins.ts`
- `capacityMeter.ts` — used by 3 files
  - `app/(tabs)/trends.tsx`
  - `src/components/CarMeter.tsx`
  - `src/components/MainDepartureCard.tsx`
- `carWait.ts` — used by 3 files
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `composeDepartures.ts` — used by 2 files
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useNextDepartures.ts`
- `constants.ts` — used by 19 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `infra/lambda/plan/plan.ts`
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
- `ferryDeparture.ts` — used by 6 files
  - `app/(tabs)/timer.tsx`
  - `infra/lambda/plan/plan.ts`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `geo.ts` — used by 1 file
  - `infra/lambda/plan/plan.ts`
- `kingstonBoardingPass.ts` — used by 1 file
  - `src/components/KingstonBoardingPassPill.tsx`
- `locations.ts` — used by 3 files
  - `app/(tabs)/timer.tsx`
  - `app/_layout.tsx`
  - `src/hooks/useBestSailing.ts`
- `planEstimate.ts` — used by 1 file
  - `app/planner.tsx`
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
  - `infra/lambda/plan/plan.ts`
  - `src/components/BestSailingCard.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/components/FerryCard.tsx`
  - `src/components/LastDepartureCard.tsx`
  - `src/components/MainDepartureCard.tsx`
  - `src/hooks/useArrivalEta.ts`
  - `src/hooks/useFutureSchedule.ts`
  - `src/hooks/useLiveActivity.ts`
  - `src/hooks/useRecommendation.ts`
- `timerLegs.ts` — used by 1 file
  - `app/(tabs)/timer.tsx`
- `transitConfig.ts` — used by 5 files
  - `app/(tabs)/index.tsx`
  - `app/planner.tsx`
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useBestSailing.ts`
  - `src/hooks/useRecommendation.ts`
- `transitStats.ts` — used by 2 files
  - `src/hooks/useRecommendation.ts`
  - `src/hooks/useTransitRecords.ts`
- `typicalConditions.ts` — used by 3 files
  - `infra/lambda/plan/plan.ts`
  - `src/hooks/useCarWait.ts`
  - `src/hooks/useRecommendation.ts`
- `typicalCrossing.ts` — used by 1 file
  - `app/(tabs)/trends.tsx`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `predictedDelay.ts`

## Cross-refs

- Source folder: [`src/utils/`](../../../src/utils/)
