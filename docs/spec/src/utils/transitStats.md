---
type: l1-file
spec_version: 1
source: src/utils/transitStats.ts
content_sha: dfe39c08ee55de1d011a7ad7c43965c81972928c56e1ed3bb108b30aa25ad9c1
extractor_version: 1.1.0
renderer_version: 1.0.0
last_audited: 2026-06-23T02:13:37.721Z
---

# transitStats.ts

**Path:** `src/utils/transitStats.ts`
**Lines:** 37
**Language:** TypeScript

## Exports

| Name | Kind | Signature |
|---|---|---|
| `computeTypicalTransitSeconds` | function | `(records: Pick<TransitRecord, 'durationSeconds'>[]): TypicalTransit \| null` |
| `TypicalMethod` | type |  |
| `TypicalTransit` | interface |  |

## Imports

**Internal:**
- `../types/storage` (`TransitRecord`)
