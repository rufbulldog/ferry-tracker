---
type: l1-file
spec_version: 1
source: src/utils/capacityMeter.ts
content_sha: 02f06879ee5e3f491b13ccfb5702542fac95d2a17fc2a4f1e1abd2696f1e7c34
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-10-31T07:21:21.585Z
---

# capacityMeter.ts

**Path:** `src/utils/capacityMeter.ts`
**Lines:** 42
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `capacityTone` | function | `(percentFull: number): CapacityTone` |
| `percentFull` | function | `(driveUpSpaces: number \| null, maxSpaces: number): number \| null` |
| `filledBars` | function | `(percent: number, bars: number = METER_BARS): number` |
| `carsPerBar` | function | `(maxSpaces: number, bars: number = METER_BARS): number` |
| `CapacityTone` | type |  |
| `METER_BARS` | const | `40` |
| `CAPACITY_TONE_LABEL` | const | `Record<CapacityTone, string>` |

### Documented exports

- **`percentFull`** — Percent of drive-up space taken, 0–100, or null when space data is missing.
- **`filledBars`** — Lit bars for a fill level. Any cars aboard light at least one bar.
- **`carsPerBar`** — Cars represented by one bar, for the meter's legend.
- **`CapacityTone`** — Capacity → meter state for the Next Sailing card's car meter: how full the
