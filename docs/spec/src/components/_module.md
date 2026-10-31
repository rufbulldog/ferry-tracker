---
type: l2-module
spec_version: 1
path: src/components
file_count: 12
total_lines: 2210
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:22:22.334Z
---

# src/components — Module Spec

**Folder:** `src/components`
**Files:** 12 · **Lines:** 2210

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`AlertBanner.tsx`](./AlertBanner.md) | 122 |  |
| [`CapacityBar.tsx`](./CapacityBar.md) | 130 |  |
| [`CarMeter.tsx`](./CarMeter.md) | 50 |  |
| [`CarWaitChip.tsx`](./CarWaitChip.md) | 54 | Compact "cars may wait" notice for the Time screen. Renders nothing unless |
| [`CheckInFAB.tsx`](./CheckInFAB.md) | 138 |  |
| [`FerryCard.tsx`](./FerryCard.md) | 297 |  |
| [`FerryProgressIndicator.tsx`](./FerryProgressIndicator.md) | 121 |  |
| [`KingstonBoardingPassPill.tsx`](./KingstonBoardingPassPill.md) | 75 | Compact notice for the Kingston terminal's vehicle boarding-pass requirement. |
| [`LastDepartureCard.tsx`](./LastDepartureCard.md) | 163 |  |
| [`MainDepartureCard.tsx`](./MainDepartureCard.md) | 694 | The leave-by plan for this sailing (formerly the Leave tab). |
| [`MonthCalendar.tsx`](./MonthCalendar.md) | 151 | Lightweight month-grid date picker (pure JS/RN — no native date-picker dep). |
| [`RouteSelector.tsx`](./RouteSelector.md) | 215 |  |

## Public surface

Files in this folder imported from elsewhere:

- `AlertBanner.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `CarWaitChip.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `CheckInFAB.tsx` — used by 2 files
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/index.tsx`
- `FerryCard.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `KingstonBoardingPassPill.tsx` — used by 1 file
  - `app/(tabs)/index.tsx`
- `LastDepartureCard.tsx` — used by 1 file
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
- `CarMeter.tsx`
- `FerryProgressIndicator.tsx`

## Cross-refs

- Source folder: [`src/components/`](../../../src/components/)
