---
type: l2-module
spec_version: 1
path: src/components
file_count: 14
total_lines: 2527
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-11-02T08:06:25.480Z
---

# src/components — Module Spec

**Folder:** `src/components`
**Files:** 14 · **Lines:** 2527

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`AlertBanner.tsx`](./AlertBanner.md) | 122 |  |
| [`BestSailingCard.tsx`](./BestSailingCard.md) | 220 | "Best from here" — which terminal to drive to and which sailing you can make, |
| [`CapacityBar.tsx`](./CapacityBar.md) | 130 |  |
| [`CarMeter.tsx`](./CarMeter.md) | 50 |  |
| [`CarWaitChip.tsx`](./CarWaitChip.md) | 54 | Compact "cars may wait" notice for the Time screen. Renders nothing unless |
| [`CheckInFAB.tsx`](./CheckInFAB.md) | 138 |  |
| [`DepartedStrip.tsx`](./DepartedStrip.md) | 122 | The boat that just left, as one line at the foot of the Next Sailing card: |
| [`FerryCard.tsx`](./FerryCard.md) | 297 |  |
| [`FerryProgressIndicator.tsx`](./FerryProgressIndicator.md) | 121 |  |
| [`KingstonBoardingPassPill.tsx`](./KingstonBoardingPassPill.md) | 75 | Compact notice for the Kingston terminal's vehicle boarding-pass requirement. |
| [`LiveActivityPill.tsx`](./LiveActivityPill.md) | 66 | Toggle for the Live Activity (Lock Screen, Dynamic Island, CarPlay |
| [`MainDepartureCard.tsx`](./MainDepartureCard.md) | 772 | The leave-by plan for this sailing (formerly the Leave tab). |
| [`MonthCalendar.tsx`](./MonthCalendar.md) | 151 | Lightweight month-grid date picker (pure JS/RN — no native date-picker dep). |
| [`RouteSelector.tsx`](./RouteSelector.md) | 209 |  |

## Public surface

Files in this folder imported from elsewhere:

- `AlertBanner.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `BestSailingCard.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `CarMeter.tsx` — used by 2 files
  - `app/(tabs)/timer.tsx`
  - `app/(tabs)/trends.tsx`
- `CarWaitChip.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `CheckInFAB.tsx` — used by 2 files
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/index.tsx`
- `FerryCard.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `KingstonBoardingPassPill.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `LiveActivityPill.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `MainDepartureCard.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `MonthCalendar.tsx` — used by 1 file
  - `app/planner.tsx`
- `RouteSelector.tsx` — used by 1 file
  - `app/(tabs)/_layout.tsx`

## Internal-only files

Files in this folder not imported by any file outside it (candidates for cleanup or relocation):

- `CapacityBar.tsx`
- `DepartedStrip.tsx`
- `FerryProgressIndicator.tsx`

## Cross-refs

- Source folder: [`src/components/`](../../../src/components/)
