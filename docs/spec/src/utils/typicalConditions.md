---
type: l1-file
spec_version: 1
source: src/utils/typicalConditions.ts
content_sha: e9d1c4fa292d0a23403f44e081506e70df3a269170ca8f797bfcbb9365766ecf
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-11-01T06:16:16.513Z
---

# typicalConditions.ts

**Path:** `src/utils/typicalConditions.ts`
**Lines:** 68
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `trimmedMean` | function | `(values: number[]): number` |
| `computeTypicalForSlot` | function | `(snapshots: DepartureSnapshot[] \| undefined, refDate: Date = new Date(), hourWindow = 1): TypicalConditions` |
| `TypicalConditions` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`DepartureSnapshot`)
