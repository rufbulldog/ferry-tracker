---
type: l1-file
spec_version: 1
source: src/utils/typicalConditions.ts
content_sha: 7d533099e96bde6e11a518d21eab5667da57b28bd379a9ecd819aa4996b54062
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-08-01T19:39:26.653Z
---

# typicalConditions.ts

**Path:** `src/utils/typicalConditions.ts`
**Lines:** 68
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computeTypicalForSlot` | function | `(snapshots: DepartureSnapshot[] \| undefined, refDate: Date = new Date(), hourWindow = 1): TypicalConditions` |
| `TypicalConditions` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`DepartureSnapshot`)
