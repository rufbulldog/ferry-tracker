---
type: l2-module
spec_version: 1
path: src/store
file_count: 2
total_lines: 128
extractor_version: 1.0.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.661Z
---

# src/store — Module Spec

**Folder:** `src/store`
**Files:** 2 · **Lines:** 128

## File inventory

| File | Lines | Purpose |
|---|---|---|
| [`checkIn.ts`](./checkIn.md) | 48 | Session "I'm aboard" pin. Pressing Send ETA records which sailing the user is |
| [`personalLocations.ts`](./personalLocations.md) | 80 | Current home/work coords and contact number (synchronous read of the cache). |

## Public surface

Files in this folder imported from elsewhere:

- `checkIn.ts` — used by 2 files
  - `src/components/CheckInFAB.tsx`
  - `src/hooks/useArrivalEta.ts`
- `personalLocations.ts` — used by 4 files
  - `app/(tabs)/settings.tsx`
  - `app/_layout.tsx`
  - `src/components/CheckInFAB.tsx`
  - `src/utils/locations.ts`

## Cross-refs

- Source folder: [`src/store/`](../../../src/store/)
